import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';

@Module({
  providers: [EmployeeService, PrismaService],
  controllers: [EmployeeController],
})
export class EmployeeModule {}
