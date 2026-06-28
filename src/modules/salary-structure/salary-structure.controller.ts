import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Role } from 'src/generated/prisma/enums';
import { CreateSalaryStructureDto } from './dto/create-salary-structure.dto';
import { UpdateSalaryStructureDto } from './dto/update-salary-structure.dto';
import { SalaryStructureService } from './salary-structure.service';

@Controller('salary-structures')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.HR_MANAGER)
export class SalaryStructureController {
  constructor(private readonly service: SalaryStructureService) {}

  @Post()
  create(@Body() dto: CreateSalaryStructureDto) {
    return this.service.create(dto);
  }

  @Get(':employeeId')
  findOne(@Param('employeeId') employeeId: string) {
    return this.service.findByEmployee(employeeId);
  }

  @Patch(':employeeId')
  update(
    @Param('employeeId') employeeId: string,
    @Body() dto: UpdateSalaryStructureDto,
  ) {
    return this.service.update(employeeId, dto);
  }
}
