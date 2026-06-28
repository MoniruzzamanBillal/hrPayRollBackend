import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    UseGuards,
} from '@nestjs/common';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Role } from 'src/generated/prisma/enums';
import { CreateSalaryComponentDto } from './dto/create-salary-component.dto';
import { SalaryComponentService } from './salary-component.service';

@Controller('salary-components')
@UseGuards(JwtAuthGuard)
export class SalaryComponentController {
  constructor(private readonly service: SalaryComponentService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  create(@Body() dto: CreateSalaryComponentDto) {
    return this.service.create(dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'HR_MANAGER')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
