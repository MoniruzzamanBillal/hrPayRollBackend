import { PartialType } from '@nestjs/swagger';
import { AddDeptDto } from './AddDeptDto';

export class UpdateDeptDto extends PartialType(AddDeptDto) {}
