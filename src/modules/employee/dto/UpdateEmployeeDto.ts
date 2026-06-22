import { PartialType } from '@nestjs/swagger';
import { CreateEmployeeDto } from './CreateEmployeeDto';

export class UpdateEmployeeDto extends PartialType(CreateEmployeeDto) {}
