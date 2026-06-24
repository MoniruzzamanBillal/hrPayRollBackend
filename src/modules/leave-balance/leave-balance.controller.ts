import {
  Body,
  Controller,
  Delete,
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
import { CreateLeaveBalanceDto } from './dto/create-leave-balance.dto';
import { UpdateLeaveBalanceDto } from './dto/update-leave-balance.dto';
import { LeaveBalanceService } from './leave-balance.service';

@Controller('leave-balance')
@UseGuards(JwtAuthGuard)
export class LeaveBalanceController {
  //
  constructor(private leaveBalanceService: LeaveBalanceService) {}

  //! Assign a leave balance to an employee
  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  async create(@Body() dto: CreateLeaveBalanceDto) {
    const result = await this.leaveBalanceService.create(dto);
    return result;
  }

  //! Employee views their own leave balances
  @Get('my')
  async getMyBalances(@GetUser() user: UserPayload) {
    const result = await this.leaveBalanceService.getMyBalances(user);
    return result;
  }

  //! Get all leave balances for a specific employee
  @Get('employee/:employeeId')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  async getEmployeeBalances(@Param('employeeId') employeeId: string) {
    const result =
      await this.leaveBalanceService.getEmployeeBalances(employeeId);
    return result;
  }

  //! Update totalDays on a balance record
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  async update(@Param('id') id: string, @Body() dto: UpdateLeaveBalanceDto) {
    const result = await this.leaveBalanceService.update(id, dto);
    return result;
  }

  //! Remove a leave balance record
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  async remove(@Param('id') id: string) {
    return this.leaveBalanceService.remove(id);
  }

  //
}
