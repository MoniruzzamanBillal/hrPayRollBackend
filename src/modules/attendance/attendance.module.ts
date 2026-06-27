import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AttendanceController } from './attendance.controller';
import { AttendanceCron } from './attendance.cron';
import { AttendanceService } from './attendance.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [AttendanceController],
  providers: [AttendanceService, AttendanceCron],
})
export class AttendanceModule {}
