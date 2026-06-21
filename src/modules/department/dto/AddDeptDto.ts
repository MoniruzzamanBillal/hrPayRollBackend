import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class AddDeptDto {
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description: string;
}
