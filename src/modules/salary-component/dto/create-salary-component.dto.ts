import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { SalaryComponentType } from 'src/generated/prisma/enums';

export class CreateSalaryComponentDto {
  @IsString()
  name: string; // "House Rent", "Tax", "Provident Fund"

  @IsEnum(SalaryComponentType)
  type: SalaryComponentType; // EARNING or DEDUCTION

  @IsOptional()
  @IsBoolean()
  isFixedAmount?: boolean; // true = fixed BDT, false = % of basic
}
