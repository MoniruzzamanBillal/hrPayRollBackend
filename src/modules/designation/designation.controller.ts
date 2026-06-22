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
import { DesignationService } from './designation.service';
import { CreateDesignationDto } from './dto/CreateDesignationDto';
import { UpdateDesignationDto } from './dto/UpdateDesignationDto';

@Controller('designation')
export class DesignationController {
  //
  constructor(private designationService: DesignationService) {}

  // ! for creating designation
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  @Post('')
  async createDesignation(@Body() payload: CreateDesignationDto) {
    const result = await this.designationService.createDesignation(payload);

    return {
      result,
      message: 'Designation Created Successfully!!!',
    };
  }

  //   ! for getting all Designation
  @Get('')
  async getAllDesignation() {
    const result = await this.designationService.getAllDepartment();

    return {
      result,
      message: 'All Designation Retrived successfully!!!',
    };
  }

  // ! for getting single Designation
  @Get(':id')
  async getSingleDesignation(@Param('id') id: string) {
    const result = await this.designationService.getSingleDesignation(id);

    return {
      result,
      message: 'Designation Data Retrived successfully!!!!',
    };
  }

  // ! for updating Designation
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  @Patch(':id')
  async updateDesignation(
    @Body() payload: UpdateDesignationDto,
    @Param('id') id: string,
  ) {
    const result = await this.designationService.updateDesignation(payload, id);

    return {
      result,
      message: 'Designation Data Updated successfully!!!!',
    };
  }

  //
}
