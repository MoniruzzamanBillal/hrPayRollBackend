import {
    Body,
    Controller,
    Delete,
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
import { CreateLeaveTypeDto } from './dto/create-leave-type.dto';
import { UpdateLeaveTypeDto } from './dto/update-leave-type.dto';
import { LeaveTypeService } from './leave-type.service';

@Controller('leave-type')
@UseGuards(JwtAuthGuard)
export class LeaveTypeController {
  //

  constructor(private leaveTypeService: LeaveTypeService) {}

  // ! for getting all leave type
  @Get()
  async findAll() {
    const result = await this.leaveTypeService.findAll();
    return result;
  }

  // ! for getting single leave type
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const result = await this.leaveTypeService.findOne(id);
    return result;
  }

  //   ! for creating new leave type
  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  async create(@Body() payload: CreateLeaveTypeDto) {
    const result = await this.leaveTypeService.create(payload);
    return result;
  }

  //   ! for updating leave type
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  async update(@Param('id') id: string, @Body() payload: UpdateLeaveTypeDto) {
    const result = await this.leaveTypeService.update(id, payload);
    return result;
  }

  //   ! for deleting a leave type
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  async remove(@Param('id') id: string) {
    return this.leaveTypeService.remove(id);
  }

  //

  //
}
