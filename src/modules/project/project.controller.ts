import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';

import { createProjectDto } from './dto/createProject.dto';
import { ProjectService } from './project.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Role } from 'src/generated/prisma/enums';
import { RolesGuard } from 'src/common/guards/roles.guard';

@Controller('project')
export class ProjectController {
  constructor(private projectService: ProjectService) {}

  // ! for creating new project
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  @Post('')
  async addProject(@Body() payload: createProjectDto) {
    const result = this.projectService.addProject();

    return {
      success: true,
      status: HttpStatus.CREATED,
      message: 'project created successfully!!!',
      data: result,
    };
  }

  //   ! for getting all projects
  @Get('')
  async getAllProject() {
    const result = this.projectService.getAllProject();

    return {
      success: true,
      status: HttpStatus.OK,
      message: 'all project retrived successfully!!!',
      data: result,
    };
  }

  //   ! for getting single project
  // @Get(':id')
  // async getSingleProject(@Param('id') id: string) {
  //   const result = await this.projectService.getSingleProject(id);

  //   return {
  //     success: true,
  //     status: HttpStatus.OK,
  //     message: 'project retrived successfully!!!',
  //     data: result,
  //   };
  // }

  //
}
