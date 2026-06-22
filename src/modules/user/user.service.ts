import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma.service';
import { CreateUserDto } from './dto/create.user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  // ! for creating a new user
  async createUser(payload: CreateUserDto, imageUrl?: string) {
    const saltRounds = parseInt(process.env.SALT_ROUNDS || '10');

    const hashedPassword = await bcrypt.hash(payload?.password, saltRounds);

    const userData = {
      name: payload.name,
      email: payload.email,
      passwordHash: hashedPassword,

      ...(imageUrl && { profileImage: imageUrl }),
    };

    await this.prisma.user.create({
      data: userData,
    });
  }

  // ! for getting new user
  async getAllUser() {
    const result = await this.prisma.user.findMany();
    return result;
  }

  // ! for getting single user data
  async getSingleData(id: string) {
    const result = await this.prisma.user.findUnique({ where: { id } });

    if (!result) {
      throw new NotFoundException("User don't exist!!!");
    }

    return result;
  }

  //
}
