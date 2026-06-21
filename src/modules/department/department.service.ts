import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { AddDeptDto } from './dto/AddDeptDto';
import { UpdateDeptDto } from './dto/UpdateDeptDto';

@Injectable()
export class DepartmentService {
  //

  constructor(private prisma: PrismaService) {}

  //

  // ! for creating new department
  async createDepartment(payload: AddDeptDto) {
    const result = await this.prisma.department.create({ data: payload });

    return result;
  }

  // ! for updating new department
  async updateDepartment(payload: UpdateDeptDto, id: string) {
    const deptData = await this.prisma.department.findFirst({
      where: { id: id, isDeleted: false },
    });

    if (!deptData) {
      throw new NotFoundException("This Department don't exist!!!");
    }

    const result = await this.prisma.department.update({
      where: { id },
      data: payload,
    });

    return result;
  }

  // ! for getting all dept data
  async getAllDept() {
    const reuslt = await this.prisma.department.findMany({
      where: {
        isDeleted: false,
      },
    });

    return reuslt;
  }

  // ! for getting single department
  async getSingleDept(id: string) {
    const result = await this.prisma.department.findUnique({ where: { id } });

    return result;
  }

  //

  //
}
