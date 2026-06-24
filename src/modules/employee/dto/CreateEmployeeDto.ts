import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { EmployeeStatus, EmploymentType } from 'src/generated/prisma/enums';

export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty({ message: 'First Name is required!' })
  @MaxLength(100)
  firstName: string;

  @IsString()
  @IsNotEmpty({ message: 'Last Name is required!' })
  @MaxLength(100)
  lastName: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 character long!!!' })
  @MaxLength(50, { message: 'Password must be at most 50 character long!!!' })
  password: string;

  @IsEmail()
  @MaxLength(50)
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsDateString()
  joiningDate: string;

  @IsOptional()
  @IsEnum(EmploymentType)
  employmentType?: EmploymentType;

  @IsOptional()
  @IsEnum(EmployeeStatus)
  status?: EmployeeStatus;

  @IsString()
  departmentId: string;

  @IsString()
  designationId: string;

  @IsOptional()
  @IsString()
  managerId?: string;
}
