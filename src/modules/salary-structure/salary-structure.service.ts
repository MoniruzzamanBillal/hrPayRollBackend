import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSalaryStructureDto } from './dto/create-salary-structure.dto';
import { UpdateSalaryStructureDto } from './dto/update-salary-structure.dto';

@Injectable()
export class SalaryStructureService {
  constructor(private prisma: PrismaService) {}

  // assign salary structure to an employee
  async create(dto: CreateSalaryStructureDto) {
    // check employee exists
    const employee = await this.prisma.employee.findUnique({
      where: { id: dto.employeeId },
    });
    if (!employee) throw new NotFoundException('Employee not found');

    // check not already assigned
    const existing = await this.prisma.salaryStructure.findUnique({
      where: { employeeId: dto.employeeId },
    });
    if (existing) {
      throw new ConflictException(
        'Salary structure already exists. Use update instead.',
      );
    }

    // validate all componentIds exist
    const componentIds = dto.items.map((i) => i.componentId);
    const components = await this.prisma.salaryComponent.findMany({
      where: { id: { in: componentIds } },
    });
    if (components.length !== componentIds.length) {
      throw new BadRequestException('One or more salary components not found');
    }

    return this.prisma.$transaction(async (tx) => {
      const structure = await tx.salaryStructure.create({
        data: {
          employeeId: dto.employeeId,
          basicSalary: dto.basicSalary,
          effectiveFrom: new Date(),
          items: {
            create: dto.items.map((item) => ({
              componentId: item.componentId,
              value: item.value,
            })),
          },
        },
        include: { items: { include: { component: true } } },
      });
      return structure;
    });
  }

  // get one employee's salary structure
  async findByEmployee(employeeId: string) {
    const structure = await this.prisma.salaryStructure.findUnique({
      where: { employeeId },
      include: {
        items: {
          include: { component: true },
        },
        employee: {
          select: { firstName: true, lastName: true, employeeCode: true },
        },
      },
    });

    if (!structure)
      throw new NotFoundException(
        'No salary structure found for this employee',
      );
    return structure;
  }

  // update basic salary or components
  async update(employeeId: string, dto: UpdateSalaryStructureDto) {
    const structure = await this.prisma.salaryStructure.findUnique({
      where: { employeeId },
    });
    if (!structure) throw new NotFoundException('Salary structure not found');

    return this.prisma.$transaction(async (tx) => {
      // if new items provided — replace all items
      if (dto.items && dto.items.length > 0) {
        // delete old items
        await tx.salaryStructureItem.deleteMany({
          where: { salaryStructureId: structure.id },
        });
        // insert new items
        await tx.salaryStructureItem.createMany({
          data: dto.items.map((item) => ({
            salaryStructureId: structure.id,
            componentId: item.componentId,
            value: item.value,
          })),
        });
      }

      return tx.salaryStructure.update({
        where: { employeeId },
        data: {
          ...(dto.basicSalary && { basicSalary: dto.basicSalary }),
        },
        include: { items: { include: { component: true } } },
      });
    });
  }
}
