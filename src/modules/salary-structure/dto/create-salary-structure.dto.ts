import { Type } from 'class-transformer';
import {
    ArrayMinSize,
    IsArray,
    IsNumber,
    IsString,
    ValidateNested,
} from 'class-validator';

class SalaryItemDto {
  @IsString()
  componentId: string;

  @IsNumber()
  value: number; // fixed amount or percentage
}

export class CreateSalaryStructureDto {
  @IsString()
  employeeId: string;

  @IsNumber()
  basicSalary: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SalaryItemDto)
  items: SalaryItemDto[];
}
