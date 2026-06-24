import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Role } from 'src/generated/prisma/enums';
import { DepartmentService } from './department.service';
import { AddDeptDto } from './dto/AddDeptDto';
import { GetDeptQueryDto } from './dto/GetDeptQueryDto';
import { UpdateDeptDto } from './dto/UpdateDeptDto';

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

  //   ! for updating department
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  async updateDept(@Body() payload: UpdateDeptDto, @Param('id') id: string) {
    const result = await this.departmentService.updateDepartment(payload, id);

    return {
      result,
      message: 'Department Updated Successfully!!',
    };
  }

  //   ! for getting all department
  @Get('')
  async getAllDept(@Query() query: GetDeptQueryDto) {
    const result = await this.departmentService.getAllDept(query);

    return {
      result,
      message: 'All Department retrived Successfully!!!',
    };
  }

  //   ! for getting single department data
  @Get(':id')
  async getSingleDepartment(@Param('id') id: string) {
    const result = await this.departmentService.getSingleDept(id);

    return {
      result,
      message: 'Department retrived Successfully!!!',
    };
  }

  // ! for deleting department
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  async deleteDept(@Param('id') id: string) {
    await this.departmentService.deleteDepartment(id);

    return {
      message: 'Department Deleted Successfully!!!',
    };
  }

  //
  //
}
