import { Injectable, NotFoundException } from '@nestjs/common';
import {
  PayrollRecord,
  PayslipItem,
  Prisma,
  SalaryComponent,
} from 'src/generated/prisma/client';
import {
  AttendanceStatus,
  EmployeeStatus,
  LoanStatus,
  PayrollStatus,
  SalaryComponentType,
} from 'src/generated/prisma/enums';
import { PrismaService } from 'src/prisma/prisma.service';

type PayrollRecordWithItems = PayrollRecord & {
  payslipItems: (PayslipItem & { component: SalaryComponent })[];
};

type EmployeeWithSalary = Prisma.EmployeeGetPayload<{
  include: {
    salaryStructure: {
      include: {
        items: {
          include: { component: true };
        };
      };
    };
  };
}>;

@Injectable()
export class PayrollService {
  constructor(private prisma: PrismaService) {}

  // ─── Trigger payroll run for a given month/year ───────────────────
  async runPayroll(month: number, year: number) {
    // fetch all active employees who have a salary structure
    const employees = await this.prisma.employee.findMany({
      where: { status: EmployeeStatus.ACTIVE },
      include: {
        salaryStructure: {
          include: { items: { include: { component: true } } },
        },
      },
    });

    const results: Awaited<ReturnType<typeof this.processOneEmployee>>[] = [];
    const errors: { employeeId: string; reason: string }[] = [];

    for (const employee of employees) {
      try {
        if (!employee.salaryStructure) {
          errors.push({
            employeeId: employee.id,
            reason: 'No salary structure assigned',
          });
          continue;
        }

        // check if already processed for this month
        const alreadyRun = await this.prisma.payrollRecord.findUnique({
          where: {
            employeeId_month_year: {
              employeeId: employee.id,
              month,
              year,
            },
          },
        });

        if (alreadyRun) {
          errors.push({
            employeeId: employee.id,
            reason: `Payroll already processed for ${month}/${year}`,
          });
          continue;
        }

        const record = await this.processOneEmployee(employee, month, year);
        results.push(record);
      } catch (err: unknown) {
        errors.push({
          employeeId: employee.id,
          reason: (err as Error).message,
        });
      }
    }

    return {
      processed: results.length,
      skipped: errors.length,
      errors,
      records: results,
    };
  }

  // ─── Process payroll for a single employee ────────────────────────
  private async processOneEmployee(
    employee: EmployeeWithSalary,
    month: number,
    year: number,
  ) {
    // 1. get attendance summary for the month
    const { firstDay, lastDay } = this.getMonthRange(month, year);
    const workingDays = this.countWorkingDays(firstDay, lastDay);

    const attendance = await this.prisma.attendanceRecord.findMany({
      where: {
        employeeId: employee.id,
        date: { gte: firstDay, lte: lastDay },
      },
    });

    const presentDays = attendance.filter(
      (a) =>
        a.status === AttendanceStatus.PRESENT ||
        a.status === AttendanceStatus.LATE ||
        a.status === AttendanceStatus.HALF_DAY,
    ).length;

    const leaveDays = attendance.filter(
      (a) => a.status === AttendanceStatus.ON_LEAVE,
    ).length;

    const absentDays = attendance.filter(
      (a) => a.status === AttendanceStatus.ABSENT,
    ).length;

    // 2. calculate earnings and deductions from salary structure
    const structure = employee.salaryStructure;
    if (!structure) {
      throw new Error('No salary structure assigned');
    }
    const basicSalary = Number(structure.basicSalary);

    let grossEarnings = basicSalary;
    let totalDeductions = 0;
    const payslipItems: { componentId: string; amount: number }[] = [];

    for (const item of structure.items) {
      const component = item.component;

      // calculate value — fixed or percentage of basic
      const amount = component.isFixedAmount
        ? Number(item.value)
        : (basicSalary * Number(item.value)) / 100;

      payslipItems.push({ componentId: component.id, amount });

      if (component.type === SalaryComponentType.EARNING) {
        grossEarnings += amount;
      } else {
        totalDeductions += amount;
      }
    }

    // 3. absence deduction
    const perDayRate = basicSalary / workingDays;
    const absenceDeduct = perDayRate * absentDays;
    totalDeductions += absenceDeduct;

    // 4. loan EMI deduction
    const activeLoan = await this.prisma.loan.findFirst({
      where: {
        employeeId: employee.id,
        status: LoanStatus.ACTIVE,
      },
    });

    let loanEmi = 0;
    let activeLoanId: string | null = null;

    if (activeLoan) {
      // check not already repaid this month
      const alreadyRepaid = await this.prisma.loanRepayment.findUnique({
        where: {
          loanId_month_year: {
            loanId: activeLoan.id,
            month,
            year,
          },
        },
      });

      if (!alreadyRepaid) {
        loanEmi = Number(activeLoan.emiAmount);
        activeLoanId = activeLoan.id;
        totalDeductions += loanEmi;
      }
    }

    // 5. net pay
    const netPay = grossEarnings - totalDeductions;

    // 6. write everything in one transaction
    return this.prisma.$transaction<PayrollRecordWithItems>(async (tx) => {
      // create payroll record
      const payrollRecord = await tx.payrollRecord.create({
        data: {
          employeeId: employee.id,
          month,
          year,
          presentDays,
          absentDays,
          leaveDays,
          grossEarnings,
          totalDeductions,
          netPay,
          status: PayrollStatus.PROCESSED,
          processedAt: new Date(),
          payslipItems: {
            create: payslipItems,
          },
        },
        include: { payslipItems: { include: { component: true } } },
      });

      // create loan repayment record if EMI deducted
      if (activeLoanId && loanEmi > 0) {
        await tx.loanRepayment.create({
          data: {
            loanId: activeLoanId,
            month,
            year,
            amount: loanEmi,
          },
        });

        // check if loan fully repaid
        const allRepayments = await tx.loanRepayment.count({
          where: { loanId: activeLoanId },
        });

        if (allRepayments >= activeLoan!.installments) {
          await tx.loan.update({
            where: { id: activeLoanId },
            data: { status: LoanStatus.COMPLETED },
          });
        }
      }

      return payrollRecord;
    });
  }

  // ─── Get a single employee's payslip ─────────────────────────────
  async getPayslip(employeeId: string, month: number, year: number) {
    const record = await this.prisma.payrollRecord.findUnique({
      where: {
        employeeId_month_year: { employeeId, month, year },
      },
      include: {
        payslipItems: { include: { component: true } },
        employee: {
          select: {
            firstName: true,
            lastName: true,
            employeeCode: true,
            department: { select: { name: true } },
            designation: { select: { title: true } },
          },
        },
      },
    });

    if (!record) throw new NotFoundException('Payslip not found');
    return record;
  }

  // ─── Get all payslips for one employee ───────────────────────────
  async getEmployeePayslips(employeeId: string) {
    return this.prisma.payrollRecord.findMany({
      where: { employeeId },
      include: { payslipItems: { include: { component: true } } },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
  }

  // ─── Mark payroll as PAID ─────────────────────────────────────────
  async markAsPaid(month: number, year: number) {
    return this.prisma.payrollRecord.updateMany({
      where: { month, year, status: PayrollStatus.PROCESSED },
      data: { status: PayrollStatus.PAID, paidAt: new Date() },
    });
  }

  // ─── Helpers ──────────────────────────────────────────────────────
  private getMonthRange(month: number, year: number) {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0); // last day of month
    return { firstDay, lastDay };
  }

  private countWorkingDays(start: Date, end: Date): number {
    let count = 0;
    const current = new Date(start);
    while (current <= end) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) count++;
      current.setDate(current.getDate() + 1);
    }
    return count;
  }
}
