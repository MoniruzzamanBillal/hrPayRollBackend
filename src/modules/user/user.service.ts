import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create.user.dto';
import { GetUserQueryDto } from './dto/get.user.query.dto';

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

  // ! for getting all users
  async getAllUser(query: GetUserQueryDto) {
    const { search, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const searchFilter = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const where = { ...searchFilter };

    const [data, totalItems] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
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
