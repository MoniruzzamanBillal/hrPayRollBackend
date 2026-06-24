import { IsNotEmpty, IsString } from 'class-validator';

export class EmployeeDocumentDto {
  @IsString()
  @IsNotEmpty({ message: 'Type is required!!!' })
  type: string;
}
