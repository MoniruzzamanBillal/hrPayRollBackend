import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
    AttendanceStatus,
    EmployeeStatus,
    LeaveStatus,
} from 'src/generated/prisma/enums';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AttendanceCron {
  private readonly logger = new Logger(AttendanceCron.name);

  constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async markAbsentees() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday

    // get all active employees
    const activeEmployees = await this.prisma.employee.findMany({
      where: {
        status: {
          in: [EmployeeStatus.ACTIVE],
        },
      },
      select: { id: true },
    });

    for (const employee of activeEmployees) {
      // skip if record already exists for today
      const existing = await this.prisma.attendanceRecord.findUnique({
        where: {
          employeeId_date: {
            employeeId: employee.id,
            date: today,
          },
        },
      });

      if (existing) continue; // already checked in or handled

      // check if they have an approved leave for today
      const onLeave = await this.prisma.leaveRequest.findFirst({
        where: {
          employeeId: employee.id,
          status: LeaveStatus.APPROVED,
          startDate: { lte: today },
          endDate: { gte: today },
        },
      });

      // determine the correct status
      let status: AttendanceStatus;

      if (dayOfWeek === 0 || dayOfWeek === 6) {
        status = AttendanceStatus.WEEKEND;
      } else if (onLeave) {
        status = AttendanceStatus.ON_LEAVE;
      } else {
        status = AttendanceStatus.ABSENT;
      }

      await this.prisma.attendanceRecord.create({
        data: {
          employeeId: employee.id,
          date: today,
          status,
        },
      });
    }

    this.logger.log(`Attendance auto-marked for ${today.toDateString()}`);
  }
}
