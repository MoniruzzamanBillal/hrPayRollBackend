import { Module } from '@nestjs/common';
import { SalaryComponentController } from './salary-component.controller';
import { SalaryComponentService } from './salary-component.service';

@Module({
  controllers: [SalaryComponentController],
  providers: [SalaryComponentService]
})
export class SalaryComponentModule {}
