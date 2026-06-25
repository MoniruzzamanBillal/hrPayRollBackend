import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EmployeeStatus } from 'src/generated/prisma/enums';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDesignationDto } from './dto/CreateDesignationDto';
import { GetDesignationQueryDto } from './dto/GetDesignationQueryDto';
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

  //   ! for getting all designation
  async getAllDesignation(query: GetDesignationQueryDto) {
    const { search, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const searchFilter = search
      ? { title: { contains: search, mode: 'insensitive' as const } }
      : {};

    const where = { isDeleted: false, ...searchFilter };

    const [data, totalItems] = await Promise.all([
      this.prisma.designation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.designation.count({ where }),
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
