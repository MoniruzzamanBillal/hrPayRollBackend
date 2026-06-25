import { IsNotEmpty, IsString } from 'class-validator';

export class RejectLeaveRequestDto {
  @IsString()
  @IsNotEmpty()
  rejectReason: string;
}
