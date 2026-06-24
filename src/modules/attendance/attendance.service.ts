import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { AttendanceStatus } from 'src/generated/prisma/enums';
import { PrismaService } from 'src/prisma.service';
@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  // ! for checkin
  async checkIn(employeeId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // check if already checked in today
    const existing = await this.prisma.attendanceRecord.findUnique({
      where: {
        employeeId_date: {
          // this is the @@unique compound key
          employeeId,
          date: today,
        },
      },
    });

    if (existing) {
      throw new BadRequestException('Already checked in today');
    }

    const now = new Date();

    // define your work start time — e.g. 9:00 AM
    const workStartHour = 9;
    const isLate =
      now.getHours() > workStartHour ||
      (now.getHours() === workStartHour && now.getMinutes() > 15); // 15 min grace

    return this.prisma.attendanceRecord.create({
      data: {
        employeeId,
        date: today,
        checkIn: now,
        status: isLate ? AttendanceStatus.LATE : AttendanceStatus.PRESENT,
      },
    });
  }

  // ! for checkout
  async checkOut(employeeId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const record = await this.prisma.attendanceRecord.findUnique({
      where: {
        employeeId_date: {
          employeeId,
          date: today,
        },
      },
    });

    if (!record) {
      throw new BadRequestException('You have not checked in today');
    }

    if (record.checkOut) {
      throw new BadRequestException('Already checked out today');
    }

    const now = new Date();

    // half day logic — if checking out before 1 PM
    const isHalfDay = now.getHours() < 13;

    return this.prisma.attendanceRecord.update({
      where: {
        employeeId_date: {
          employeeId,
          date: today,
        },
      },
      data: {
        checkOut: now,
        ...(isHalfDay && record.status === AttendanceStatus.PRESENT
          ? { status: AttendanceStatus.HALF_DAY }
          : {}),
      },
    });
  }

  async getMyAttendance(userId: string, month?: number, year?: number) {
    const employee = await this.prisma.employee.findUnique({
      where: { userId },
    });

    if (!employee) {
      throw new ForbiddenException('Current user is not an employee.');
    }

    let dateFilter = {};
    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 1);
      dateFilter = { gte: start, lt: end };
    }

    return this.prisma.attendanceRecord.findMany({
      where: {
        employeeId: employee.id,
        ...(month && year ? { date: dateFilter } : {}),
      },
      orderBy: { date: 'desc' },
    });
  }

  //
}
