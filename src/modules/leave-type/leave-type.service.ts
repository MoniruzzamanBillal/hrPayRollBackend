import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateLeaveTypeDto } from './dto/create-leave-type.dto';
import { UpdateLeaveTypeDto } from './dto/update-leave-type.dto';

@Injectable()
export class LeaveTypeService {
  //
  constructor(private prisma: PrismaService) {}

  //! create new leave type
  async create(dto: CreateLeaveTypeDto) {
    // check duplicate name
    const existing = await this.prisma.leaveType.findUnique({
      where: { name: dto.name },
    });

    if (existing) {
      throw new ConflictException(`Leave type "${dto.name}" already exists`);
    }

    return this.prisma.leaveType.create({
      data: {
        name: dto.name,
        daysPerYear: dto.daysPerYear,
        isPaid: dto.isPaid ?? true,
      },
    });
  }

  //! get all leave types
  async findAll() {
    return this.prisma.leaveType.findMany({
      orderBy: { name: 'asc' },
    });
  }

  //! get single leave type
  async findOne(id: string) {
    const leaveType = await this.prisma.leaveType.findUnique({
      where: { id },
    });

    if (!leaveType) throw new NotFoundException('Leave type not found');

    return leaveType;
  }

  //! update leave type
  async update(id: string, dto: UpdateLeaveTypeDto) {
    await this.findOne(id); // throws if not found

    // if name is changing, check no duplicate
    if (dto.name) {
      const duplicate = await this.prisma.leaveType.findFirst({
        where: {
          name: dto.name,
          NOT: { id }, // exclude current record
        },
      });

      if (duplicate) {
        throw new ConflictException(`Leave type "${dto.name}" already exists`);
      }
    }

    return this.prisma.leaveType.update({
      where: { id },
      data: dto,
    });
  }

  //! delete — only if no leave requests are using it
  async remove(id: string) {
    await this.findOne(id);

    const inUse = await this.prisma.leaveRequest.findFirst({
      where: { leaveTypeId: id },
    });

    if (inUse) {
      throw new ConflictException(
        'Cannot delete — this leave type has existing leave requests',
      );
    }

    return this.prisma.leaveType.delete({ where: { id } });
  }

  //
}
