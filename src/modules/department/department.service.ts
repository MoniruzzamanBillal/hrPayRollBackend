import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EmployeeStatus } from 'src/generated/prisma/enums';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddDeptDto } from './dto/AddDeptDto';
import { GetDeptQueryDto } from './dto/GetDeptQueryDto';
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
  async getAllDept(query: GetDeptQueryDto) {
    const { search, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const searchFilter = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { description: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const where = { isDeleted: false, ...searchFilter };

    const [data, totalItems] = await Promise.all([
      this.prisma.department.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.department.count({ where }),
    ]);

    return {
      data,
      meta: {
        currentPage: page,
        itemCount: data.length,
        limit,
        totalItems,
        totalPage: Math.ceil(totalItems / limit),
      },
    };
  }

  // ! for getting single department
  async getSingleDept(id: string) {
    const result = await this.prisma.department.findUnique({ where: { id } });

    return result;
  }

  // ! for deleting department
  async deleteDepartment(id: string) {
    const deptData = await this.prisma.department.findFirst({
      where: { id, isDeleted: false },
    });

    if (!deptData) {
      throw new NotFoundException("This Department don't exist!!!");
    }

    const activeEmployeeCount = await this.prisma.employee.count({
      where: {
        departmentId: id,
        status: {
          notIn: [EmployeeStatus.TERMINATED, EmployeeStatus.RESIGNED],
        },
      },
    });

    if (activeEmployeeCount > 0) {
      throw new BadRequestException(
        `Cannot delete department. ${activeEmployeeCount} employee(s) are still assigned to it.`,
      );
    }

    await this.prisma.department.update({
      where: { id },
      data: { isDeleted: true },
    });
  }

  //

  //
}
