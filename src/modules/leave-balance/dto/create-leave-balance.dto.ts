import { IsInt, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateLeaveBalanceDto {
  @IsString()
  @IsNotEmpty()
  employeeId: string;

  @IsString()
  @IsNotEmpty()
  leaveTypeId: string;

  @IsInt()
  @Min(2000)
  year: number;

  @IsNumber()
  @Min(0)
  totalDays: number;
}
