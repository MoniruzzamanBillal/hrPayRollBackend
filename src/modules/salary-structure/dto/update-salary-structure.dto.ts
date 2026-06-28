import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, ValidateNested } from 'class-validator';

class SalaryItemDto {
  @IsNumber() componentId: string;
  @IsNumber() value: number;
}

export class UpdateSalaryStructureDto {
  @IsOptional()
  @IsNumber()
  basicSalary?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SalaryItemDto)
  items?: SalaryItemDto[];
}
