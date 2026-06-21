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

  //

  //
}
