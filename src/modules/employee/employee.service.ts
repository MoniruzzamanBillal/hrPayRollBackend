import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma.service';
import { CreateEmployeeDto } from './dto/CreateEmployeeDto';

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

      console.log('userResult = ', userResult);

      //
    });
  }

  //
}
