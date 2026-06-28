import {
    Body,
    Controller,
    ForbiddenException,
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
import { PayrollService } from './payroll.service';

@Controller('payroll')
@UseGuards(JwtAuthGuard)
export class PayrollController {
  constructor(private readonly service: PayrollService) {}

  // Admin only — run payroll for a month
  @Post('run')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  run(@Body() dto: { month: number; year: number }) {
    return this.service.runPayroll(dto.month, dto.year);
  }

  // Admin only — mark whole month as paid
  @Patch('mark-paid')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'HR_MANAGER')
  markPaid(@Body() dto: { month: number; year: number }) {
    return this.service.markAsPaid(dto.month, dto.year);
  }

  // Employee views own payslips
  @Get('my-payslips')
  getMyPayslips(@GetUser() user: UserPayload) {
    if (!user.employeeId) {
      throw new ForbiddenException('Employee profile not found');
    }
    return this.service.getEmployeePayslips(user.employeeId);
  }

  // Employee views specific month payslip
  @Get('my-payslips/:month/:year')
  getMyPayslip(
    @Param('month') month: string,
    @Param('year') year: string,
    @GetUser() user: UserPayload,
  ) {
    if (!user.employeeId) {
      throw new ForbiddenException('Employee profile not found');
    }
    return this.service.getPayslip(user.employeeId, +month, +year);
  }

  // Admin views any employee's payslip
  @Get(':employeeId/:month/:year')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'HR_MANAGER')
  getPayslip(
    @Param('employeeId') employeeId: string,
    @Param('month') month: string,
    @Param('year') year: string,
  ) {
    return this.service.getPayslip(employeeId, +month, +year);
  }
}
