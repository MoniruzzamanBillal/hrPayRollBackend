import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateLeaveTypeDto {
  @IsString()
  name: string; // e.g. "Annual", "Sick", "Casual"

  @IsInt()
  @Min(1)
  daysPerYear: number;

  @IsOptional()
  @IsBoolean()
  isPaid?: boolean;
}
