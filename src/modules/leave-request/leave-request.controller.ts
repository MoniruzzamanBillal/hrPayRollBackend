import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard, UserPayload } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Role } from 'src/generated/prisma/enums';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { RejectLeaveRequestDto } from './dto/reject-leave-request.dto';
import { LeaveRequestService } from './leave-request.service';

@Controller('leave-request')
@UseGuards(JwtAuthGuard)
export class LeaveRequestController {
  //
  constructor(private leaveRequestService: LeaveRequestService) {}

  //! Employee submits a new leave request
  @Post()
  create(@Body() dto: CreateLeaveRequestDto, @GetUser() user: UserPayload) {
    return this.leaveRequestService.create(dto, user);
  }

  //! Get logged-in employee's own leave requests
  @Get('my')
  getMyRequests(@GetUser() user: UserPayload) {
    return this.leaveRequestService.getMyRequests(user);
  }

  //! Get pending leave requests for the manager's direct reports
  @Get('team')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.HR_MANAGER, Role.DEPARTMENT_MANAGER)
  getTeamRequests(@GetUser() user: UserPayload) {
    return this.leaveRequestService.getTeamRequests(user);
  }

  //! Approve a pending leave request
  @Patch(':id/approve')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.HR_MANAGER, Role.DEPARTMENT_MANAGER)
  approve(@Param('id') id: string, @GetUser() user: UserPayload) {
    return this.leaveRequestService.approve(id, user);
  }

  //! Reject a pending leave request with a reason
  @Patch(':id/reject')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.HR_MANAGER, Role.DEPARTMENT_MANAGER)
  reject(
    @Param('id') id: string,
    @Body() dto: RejectLeaveRequestDto,
    @GetUser() user: UserPayload,
  ) {
    return this.leaveRequestService.reject(id, dto, user);
  }

  //! Employee cancels their own pending request
  @Patch(':id/cancel')
  cancel(@Param('id') id: string, @GetUser() user: UserPayload) {
    return this.leaveRequestService.cancel(id, user);
  }

  //
}
