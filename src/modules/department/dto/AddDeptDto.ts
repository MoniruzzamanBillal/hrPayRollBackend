import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class AddDeptDto {
  @IsString()
  @IsNotEmpty({ message: 'Name is required!!!' })
  @MaxLength(50)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description: string;
}
