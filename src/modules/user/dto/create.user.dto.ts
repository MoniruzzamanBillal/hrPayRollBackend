import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name: string;

  @IsEmail()
  @MaxLength(50)
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 character long!!!' })
  @MaxLength(50, { message: 'Password must be at most 50 character long!!!' })
  password: string;
}
