// src/payroll/salary-component/salary-component.service.ts
import {
    ConflictException,
    Injectable
} from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSalaryComponentDto } from './dto/create-salary-component.dto';

@Injectable()
export class SalaryComponentService {
  constructor(private prisma: PrismaService) {}

  //   ! for adding new salary component
  async create(dto: CreateSalaryComponentDto) {
    const existing = await this.prisma.salaryComponent.findUnique({
      where: { name: dto.name },
    });
    if (existing) throw new ConflictException(`"${dto.name}" already exists`);

    return this.prisma.salaryComponent.create({ data: dto });
  }

  //   ! for getting all salary component
  async findAll() {
    return this.prisma.salaryComponent.findMany({
      orderBy: { type: 'asc' },
    });
  }

  //   ! for deleting salary component
  async remove(id: string) {
    // check if in use
    const inUse = await this.prisma.salaryStructureItem.findFirst({
      where: { componentId: id },
    });
    if (inUse)
      throw new ConflictException(
        'Component is assigned to a salary structure',
      );

    return this.prisma.salaryComponent.delete({ where: { id } });
  }
}
