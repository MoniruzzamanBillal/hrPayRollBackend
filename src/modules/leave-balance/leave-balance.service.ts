import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserPayload } from 'src/common/guards/jwt-auth.guard';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateLeaveBalanceDto } from './dto/create-leave-balance.dto';
import { UpdateLeaveBalanceDto } from './dto/update-leave-balance.dto';

@Injectable()
export class LeaveBalanceService {
  //
  constructor(private prisma: PrismaService) {}

  //! Assign a leave balance to an employee (HR/Admin)
  async create(dto: CreateLeaveBalanceDto) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: dto.employeeId },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const leaveType = await this.prisma.leaveType.findUnique({
      where: { id: dto.leaveTypeId },
    });

    if (!leaveType) {
      throw new NotFoundException('Leave type not found');
    }

    const existing = await this.prisma.leaveBalance.findUnique({
      where: {
        employeeId_leaveTypeId_year: {
          employeeId: dto.employeeId,
          leaveTypeId: dto.leaveTypeId,
          year: dto.year,
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        `Leave balance for this employee, leave type, and year already exists`,
      );
    }

    return this.prisma.leaveBalance.create({
      data: {
        employeeId: dto.employeeId,
        leaveTypeId: dto.leaveTypeId,
        year: dto.year,
        totalDays: leaveType?.daysPerYear,
      },
      include: { leaveType: true, employee: true },
    });
  }

  //! Employee views their own leave balances
  async getMyBalances(user: UserPayload) {
    if (!user.employeeId) {
      throw new ForbiddenException(
        'No employee profile linked to this account',
      );
    }

    return this.prisma.leaveBalance.findMany({
      where: { employeeId: user.employeeId },
      include: { leaveType: true, employee: true },
      orderBy: { year: 'desc' },
    });
  }

  //! HR/Admin views all leave balances for a specific employee
  async getEmployeeBalances(employeeId: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return this.prisma.leaveBalance.findMany({
      where: { employeeId },
      include: { leaveType: true },
      orderBy: { year: 'desc' },
    });
  }

  //! Update totalDays on a balance record (usedDays is system-managed)
  async update(id: string, dto: UpdateLeaveBalanceDto) {
    const balance = await this.prisma.leaveBalance.findUnique({
      where: { id },
    });

    if (!balance) {
      throw new NotFoundException('Leave balance not found');
    }

    return this.prisma.leaveBalance.update({
      where: { id },
      data: { totalDays: dto.totalDays },
      include: { leaveType: true },
    });
  }

  //! Remove a leave balance record
  async remove(id: string) {
    const balance = await this.prisma.leaveBalance.findUnique({
      where: { id },
    });

    if (!balance) {
      throw new NotFoundException('Leave balance not found');
    }

    return this.prisma.leaveBalance.delete({ where: { id } });
  }

  //
}
