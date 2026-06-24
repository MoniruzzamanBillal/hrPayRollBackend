import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AttendanceController } from './attendance.controller';
import { AttendanceCron } from './attendance.cron';
import { AttendanceService } from './attendance.service';

@Module({
  imports: [ScheduleModule.forRoot(), PrismaModule],
  controllers: [AttendanceController],
  providers: [AttendanceService, AttendanceCron],
})
export class AttendanceModule {}
