import { PartialType } from '@nestjs/swagger';
import { CreateDesignationDto } from './CreateDesignationDto';

export class UpdateDesignationDto extends PartialType(CreateDesignationDto) {}
