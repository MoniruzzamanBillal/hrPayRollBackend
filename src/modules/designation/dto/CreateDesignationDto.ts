import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateDesignationDto {
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  @MaxLength(100)
  title: string;

  //   @IsString()
  //   @IsNotEmpty({ message: 'Department ID is required' })
  //   departmentId: string;
}
