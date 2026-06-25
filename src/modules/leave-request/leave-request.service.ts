import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserPayload } from 'src/common/guards/jwt-auth.guard';
import { LeaveStatus, Role } from 'src/generated/prisma/enums';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { RejectLeaveRequestDto } from './dto/reject-leave-request.dto';

@Injectable()
export class LeaveRequestService {
  //
  constructor(private prisma: PrismaService) {}

  //! Employee submits a leave request
  async create(dto: CreateLeaveRequestDto, user: UserPayload) {
    if (!user.employeeId) {
      throw new ForbiddenException(
        'No employee profile linked to this account',
      );
    }

    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (endDate < startDate) {
      throw new BadRequestException('End date cannot be before start date');
    }

    const totalDays = this.countWorkingDays(startDate, endDate);

    if (totalDays <= 0) {
      throw new BadRequestException('No working days in selected range');
    }

    const balance = await this.prisma.leaveBalance.findUnique({
      where: {
        employeeId_leaveTypeId_year: {
          employeeId: user.employeeId,
          leaveTypeId: dto.leaveTypeId,
          year: startDate.getFullYear(),
        },
      },
    });

    if (!balance) {
      throw new BadRequestException(
        'No leave balance found for this leave type',
      );
    }

    const remaining = balance.totalDays - balance.usedDays;
    if (totalDays > remaining) {
      throw new BadRequestException(
        `Insufficient balance. Requested: ${totalDays}, Available: ${remaining}`,
      );
    }

    const overlap = await this.prisma.leaveRequest.findFirst({
      where: {
        employeeId: user.employeeId,
        status: { in: [LeaveStatus.PENDING, LeaveStatus.APPROVED] },
        AND: [{ startDate: { lte: endDate } }, { endDate: { gte: startDate } }],
      },
    });

    if (overlap) {
      throw new BadRequestException(
        'You already have a leave request overlapping these dates',
      );
    }

    return this.prisma.leaveRequest.create({
      data: {
        employeeId: user.employeeId,
        leaveTypeId: dto.leaveTypeId,
        startDate,
        endDate,
        totalDays,
        reason: dto.reason,
        status: LeaveStatus.PENDING,
      },
      include: { leaveType: true },
    });
  }

  //! Get logged-in employee's own requests
  async getMyRequests(user: UserPayload) {
    if (!user.employeeId) {
      throw new ForbiddenException(
        'No employee profile linked to this account',
      );
    }

    return this.prisma.leaveRequest.findMany({
      where: { employeeId: user.employeeId },
      include: { leaveType: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  //! Get pending requests for the manager's direct reports
  async getTeamRequests(user: UserPayload) {
    if (!user.employeeId) {
      throw new ForbiddenException(
        'No employee profile linked to this account',
      );
    }

    return this.prisma.leaveRequest.findMany({
      where: {
        status: LeaveStatus.PENDING,
        employee: { managerId: user.employeeId },
      },
      include: {
        employee: {
          select: { firstName: true, lastName: true, employeeCode: true },
        },
        leaveType: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  //! Approve a pending leave request
  async approve(id: string, user: UserPayload) {
    const request = await this.prisma.leaveRequest.findUnique({
      where: { id },
      include: { employee: true },
    });

    if (!request) throw new NotFoundException('Leave request not found');

    if (request.status !== LeaveStatus.PENDING) {
      throw new BadRequestException('Only pending requests can be approved');
    }

    this.assertManagerScope(request.employee.managerId, user);

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.leaveRequest.update({
        where: { id },
        data: {
          status: LeaveStatus.APPROVED,
          approverId: user.employeeId,
          approvedAt: new Date(),
        },
        include: { leaveType: true },
      });

      await tx.leaveBalance.update({
        where: {
          employeeId_leaveTypeId_year: {
            employeeId: request.employeeId,
            leaveTypeId: request.leaveTypeId,
            year: new Date(request.startDate).getFullYear(),
          },
        },
        data: { usedDays: { increment: request.totalDays } },
      });

      return updated;
    });
  }

  //! Reject a pending leave request
  async reject(id: string, dto: RejectLeaveRequestDto, user: UserPayload) {
    const request = await this.prisma.leaveRequest.findUnique({
      where: { id },
      include: { employee: true },
    });

    if (!request) throw new NotFoundException('Leave request not found');

    if (request.status !== LeaveStatus.PENDING) {
      throw new BadRequestException('Only pending requests can be rejected');
    }

    this.assertManagerScope(request.employee.managerId, user);

    return this.prisma.leaveRequest.update({
      where: { id },
      data: {
        status: LeaveStatus.REJECTED,
        approverId: user.employeeId,
        rejectReason: dto.rejectReason,
      },
    });
  }

  //! Employee cancels their own pending request
  async cancel(id: string, user: UserPayload) {
    const request = await this.prisma.leaveRequest.findUnique({
      where: { id },
    });

    if (!request) throw new NotFoundException('Leave request not found');

    if (request.employeeId !== user.employeeId) {
      throw new ForbiddenException('You can only cancel your own requests');
    }

    if (request.status !== LeaveStatus.PENDING) {
      throw new BadRequestException('Only pending requests can be cancelled');
    }

    return this.prisma.leaveRequest.update({
      where: { id },
      data: { status: LeaveStatus.CANCELLED },
    });
  }

  //! Count working days between two dates (excludes weekends)
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

  //! ADMIN / HR_MANAGER / DEPARTMENT_MANAGER bypass scope check; others must be the direct manager
  private assertManagerScope(
    employeeManagerId: string | null,
    user: UserPayload,
  ) {
    const isPrivileged =
      user.role === Role.ADMIN ||
      user.role === Role.HR_MANAGER ||
      user.role === Role.DEPARTMENT_MANAGER;

    if (isPrivileged) return;

    if (employeeManagerId !== user.employeeId) {
      throw new ForbiddenException(
        'You can only approve/reject requests from your direct reports',
      );
    }
  }

  //
}
