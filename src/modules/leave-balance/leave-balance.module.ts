import { Module } from '@nestjs/common';
import { LeaveBalanceController } from './leave-balance.controller';
import { LeaveBalanceService } from './leave-balance.service';

@Module({
  controllers: [LeaveBalanceController],
  providers: [LeaveBalanceService],
})
export class LeaveBalanceModule {}
