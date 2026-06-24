import {
  Controller,
  ForbiddenException,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard, UserPayload } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Role } from 'src/generated/prisma/enums';
import { AttendanceService } from './attendance.service';

@Controller('attendance')
export class AttendanceController {
  //

  constructor(private attendanceSerce: AttendanceService) {}

  // ! for attendance
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  @Post('check-in')
  async checkIn(@GetUser() user: UserPayload) {
    if (!user.employeeId) {
      throw new ForbiddenException(
        'No employee profile linked to this account.',
      );
    }
    return await this.attendanceSerce.checkIn(user.employeeId);
  }

  // ! for checkout
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  @Post('check-out')
  async checkOut(@GetUser() user: UserPayload) {
    if (!user.employeeId) {
      throw new ForbiddenException(
        'No employee profile linked to this account.',
      );
    }
    return await this.attendanceSerce.checkOut(user.employeeId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  getMyAttendance(
    @GetUser('userId') userId: string,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    return this.attendanceSerce.getMyAttendance(
      userId,
      month ? +month : undefined,
      year ? +year : undefined,
    );
  }

  //
}
