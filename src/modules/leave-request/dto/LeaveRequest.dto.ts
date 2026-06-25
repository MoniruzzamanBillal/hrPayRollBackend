import { IsDateString, IsOptional, IsString } from 'class-validator';

export class LeaveRequestDto {
  @IsString()
  leaveTypeId: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
