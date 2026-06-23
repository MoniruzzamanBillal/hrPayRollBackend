import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard, UserPayload } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Role } from 'src/generated/prisma/enums';
import { CreateEmployeeDto } from './dto/CreateEmployeeDto';
import { EmployeeDocumentDto } from './dto/EmployeeDocumentDto';
import { UpdateEmployeeDto } from './dto/UpdateEmployeeDto';
import { EmployeeService } from './employee.service';

@Controller('employee')
export class EmployeeController {
  //
  constructor(private employeeService: EmployeeService) {}

  // ! for creating a new employee
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  @Post('')
  @UseInterceptors(
    FileInterceptor('profileImage', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueName + extname(file.originalname));
        },
      }),
    }),
  )
  async addEmployee(
    @Body() payload: CreateEmployeeDto,
    @UploadedFile() profileImage: Express.Multer.File,
  ) {
    const imageUrl =
      profileImage &&
      `${process.env.APP_URL}/uploads/${profileImage?.filename}`;

    await this.employeeService.addEmployee(payload, imageUrl);

    return {
      message: 'Employee Added successfully!!!',
    };
  }

  //
  // ! for getting all employee
  @Get('')
  async getAllEmployee() {
    const result = await this.employeeService.getAllEmployee();

    return {
      result,
      message: 'All Employee retrived successfully!!',
    };
  }

  // ! for getting single employee
  @Get(':id')
  async getSingleEmployee(@Param('id') id: string) {
    const result = await this.employeeService.getSingleEmployee(id);

    return {
      result,
      message: 'Employee retrived successfully!!!',
    };
  }

  // ! for updating employee
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('profileImage', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueName + extname(file.originalname));
        },
      }),
    }),
  )
  async updateEmployee(
    @Param('id') id: string,
    @Body() payload: UpdateEmployeeDto,
    @UploadedFile() profileImage: Express.Multer.File,
  ) {
    const imageUrl =
      profileImage &&
      `${process.env.APP_URL}/uploads/${profileImage?.filename}`;

    await this.employeeService.updateEmployee(id, payload, imageUrl);

    return {
      message: 'Employee updated successfully!!!',
    };
  }

  // ! for terminating employee
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.HR_MANAGER)
  @Delete(':id')
  async terminateEmployee(@Param('id') id: string) {
    await this.employeeService.terminateEmployee(id);

    return {
      message: 'Employee terminated successfully!!!',
    };
  }

  // ! for uploading employee document
  @UseGuards(JwtAuthGuard)
  @Post('document')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueName + extname(file.originalname));
        },
      }),
    }),
  )
  async addEmployeeDocument(
    @GetUser() user: UserPayload,
    @Body() payload: EmployeeDocumentDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const fileUrl = file && `${process.env.APP_URL}/uploads/${file.filename}`;

    if (!fileUrl) {
      throw new BadRequestException('File is required');
    }

    await this.employeeService.addEmployeeDocument(
      user.userId,
      payload,
      fileUrl,
    );

    return {
      message: 'Employee Document uploaded successfully!!!',
    };
  }

  //
}
