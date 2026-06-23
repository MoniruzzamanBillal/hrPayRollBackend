import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { EmployeeStatus } from 'src/generated/prisma/enums';
import { PrismaService } from 'src/prisma.service';
import { CreateEmployeeDto } from './dto/CreateEmployeeDto';
import { EmployeeDocumentDto } from './dto/EmployeeDocumentDto';
import { UpdateEmployeeDto } from './dto/UpdateEmployeeDto';

@Injectable()
export class EmployeeService {
  //

  constructor(private prisma: PrismaService) {}

  // ! for creating a new employee
  async addEmployee(payload: CreateEmployeeDto, imageUrl?: string) {
    const saltRounds = parseInt(process.env.SALT_ROUNDS || '10');

    const hashedPassword = await bcrypt.hash(payload?.password, saltRounds);
    const name = `${payload.firstName} ${payload.lastName}`;

    return this.prisma.$transaction(async (tx) => {
      const userData = {
        name,
        email: payload.email,
        passwordHash: hashedPassword,

        ...(imageUrl && { profileImage: imageUrl }),
      };

      // * create user
      const userResult = await tx.user.create({
        data: userData,
      });

      const result = await tx.$queryRaw<[{ nextval: bigint }]>`
      SELECT nextval('employee_code_seq')
    `;

      const num = Number(result[0].nextval);
      const employeeCode = `EMP-${String(num).padStart(4, '0')}`; // EMP-0001

      const employeeData = {
        employeeCode,
        userId: userResult?.id,
        firstName: payload.firstName,
        lastName: payload.lastName,
        departmentId: payload.departmentId,
        designationId: payload.designationId,
        joiningDate: new Date(payload.joiningDate),
        managerId: payload.managerId ?? null,
      };

      // * create employee data
      await tx.employee.create({ data: employeeData });

      //
    });
  }

  //
  // ! for getting all employee
  async getAllEmployee() {
    const result = await this.prisma.employee.findMany({
      where: {
        status: {
          in: [EmployeeStatus.ACTIVE, EmployeeStatus.ON_LEAVE],
        },
      },
    });

    return result;
  }
  //

  // ! for getting single employee
  async getSingleEmployee(id: string) {
    const result = await this.prisma.employee.findFirst({
      where: {
        id,
        status: {
          in: [EmployeeStatus.ACTIVE, EmployeeStatus.ON_LEAVE],
        },
      },
      include: {
        documents: {
          where: {
            isDeleted: false,
          },
        },
      },
    });

    return result;
  }

  // ! for updating employee
  async updateEmployee(
    id: string,
    payload: UpdateEmployeeDto,
    imageUrl?: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const employee = await tx.employee.findFirst({
        where: {
          id,
          status: {
            in: [EmployeeStatus.ACTIVE, EmployeeStatus.ON_LEAVE],
          },
        },
      });

      if (!employee) {
        throw new NotFoundException(`Employee not found`);
      }

      const userUpdateData: Record<string, any> = {};

      if (payload.firstName || payload.lastName) {
        // fetch current values to fill in whichever side wasn't changed
        const currentEmployee = await tx.employee.findUnique({
          where: { id },
          select: { firstName: true, lastName: true },
        });

        const updatedFirstName =
          payload.firstName ?? currentEmployee?.firstName;
        const updatedLastName = payload.lastName ?? currentEmployee?.lastName;

        userUpdateData.name = `${updatedFirstName} ${updatedLastName}`;
      }

      if (imageUrl) {
        userUpdateData.profileImage = imageUrl;
      }

      // * update the user
      if (Object.keys(userUpdateData).length > 0) {
        await tx.user.update({
          where: { id: employee.userId },
          data: userUpdateData,
        });
      }

      // * udpate the employee
      const employeeUpdateData: Record<string, any> = {};

      if (payload.firstName) employeeUpdateData.firstName = payload.firstName;
      if (payload.lastName) employeeUpdateData.lastName = payload.lastName;
      if (payload.phone) employeeUpdateData.phone = payload.phone;
      if (payload.address) employeeUpdateData.address = payload.address;
      if (payload.dateOfBirth)
        employeeUpdateData.dateOfBirth = new Date(payload.dateOfBirth);
      if (payload.joiningDate)
        employeeUpdateData.joiningDate = new Date(payload.joiningDate);
      if (payload.departmentId)
        employeeUpdateData.departmentId = payload.departmentId;
      if (payload.designationId)
        employeeUpdateData.designationId = payload.designationId;
      if (payload.managerId) employeeUpdateData.managerId = payload.managerId;
      if (payload.employmentType)
        employeeUpdateData.employmentType = payload.employmentType;
      if (payload.status) employeeUpdateData.status = payload.status;

      if (Object.keys(employeeUpdateData).length > 0) {
        await tx.employee.update({
          where: { id },
          data: employeeUpdateData,
        });
      }
    });
  }

  // ! for terminating employee
  async terminateEmployee(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const employee = await tx.employee.findFirst({
        where: {
          id,
          status: {
            in: [EmployeeStatus.ACTIVE, EmployeeStatus.ON_LEAVE],
          },
        },
      });

      if (!employee) {
        throw new NotFoundException('Employee not found');
      }

      await tx.employee.update({
        where: { id },
        data: { status: EmployeeStatus.TERMINATED },
      });

      await tx.user.update({
        where: { id: employee.userId },
        data: { isActive: false },
      });
    });
  }

  // ! for adding employee document
  async addEmployeeDocument(
    userId: string,
    payload: EmployeeDocumentDto,
    fileUrl: string,
  ) {
    const employee = await this.prisma.employee.findUnique({
      where: {
        userId,
        status: {
          in: [EmployeeStatus.ACTIVE, EmployeeStatus.ON_LEAVE],
        },
      },
    });

    if (!employee) {
      throw new ForbiddenException('Current user is not an employee.');
    }

    await this.prisma.employeeDocument.create({
      data: {
        employeeId: employee.id,
        type: payload.type,
        fileUrl,
      },
    });
  }

  //
}
