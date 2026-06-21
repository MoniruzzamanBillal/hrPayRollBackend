import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Role } from 'src/generated/prisma/enums';
import { DepartmentService } from './department.service';
import { AddDeptDto } from './dto/AddDeptDto';

@Controller('department')
export class DepartmentController {
  //

  constructor(private departmentService: DepartmentService) {}

  // ! for creating a new department
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('')
  async createDepartment(@Body() payload: AddDeptDto) {
    const result = await this.departmentService.createDepartment(payload);

    return {
      result,
      message: 'Department Created Successfully!!!',
    };
  }

  //
}
