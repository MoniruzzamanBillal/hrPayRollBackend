import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { AddDeptDto } from './dto/AddDeptDto';

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
