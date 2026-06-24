import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EmployeeStatus } from 'src/generated/prisma/enums';
import { PrismaService } from 'src/prisma.service';
import { CreateDesignationDto } from './dto/CreateDesignationDto';
import { UpdateDesignationDto } from './dto/UpdateDesignationDto';

@Injectable()
export class DesignationService {
  //

  constructor(private prisma: PrismaService) {}

  // ! for adding new designation
  async createDesignation(payload: CreateDesignationDto) {
    const result = await this.prisma.designation.create({ data: payload });

    return result;
  }

  //   ! for getting all department
  async getAllDepartment() {
    const result = await this.prisma.designation.findMany({
      where: { isDeleted: false },
    });

    return result;
  }

  // ! for getting single department
  async getSingleDesignation(id: string) {
    const desigData = await this.prisma.designation.findFirst({
      where: { id },
    });

    if (!desigData) {
      throw new NotFoundException("This Designation don't exist!!!");
    }

    return desigData;
  }

  // ! for updating a department
  async updateDesignation(payload: UpdateDesignationDto, id: string) {
    const desigData = await this.prisma.designation.findFirst({
      where: { id },
    });

    if (!desigData) {
      throw new NotFoundException("This Designation don't exist!!!");
    }

    const result = await this.prisma.designation.update({
      where: { id },
      data: payload,
    });

    return result;
  }

  // ! for deleting designation
  async deleteDesignation(id: string) {
    const desigData = await this.prisma.designation.findFirst({
      where: { id, isDeleted: false },
    });

    if (!desigData) {
      throw new NotFoundException("This Designation don't exist!!!");
    }

    const activeEmployeeCount = await this.prisma.employee.count({
      where: {
        designationId: id,
        status: {
          notIn: [EmployeeStatus.TERMINATED, EmployeeStatus.RESIGNED],
        },
      },
    });

    if (activeEmployeeCount > 0) {
      throw new BadRequestException(
        `Cannot delete designation. ${activeEmployeeCount} employee(s) are still assigned to it.`,
      );
    }

    await this.prisma.designation.update({
      where: { id },
      data: { isDeleted: true },
    });
  }

  //
}
