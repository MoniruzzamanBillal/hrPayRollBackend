import { Injectable, UnauthorizedException } from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma.service';
import { LoginDto } from './dto/login.dto';

// employeeCode = `EMP-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  //

  // ! for login user
  async loginUser(payload: LoginDto) {
    const userData = await this.prisma.user.findUnique({
      where: { email: payload?.email },
      include: { employee: true },
    });

    if (!userData) {
      throw new UnauthorizedException('Invalid Email!!!');
    }

    const isPasswordMatch = await bcrypt.compare(
      payload?.password,
      userData?.passwordHash,
    );

    if (!isPasswordMatch) {
      throw new UnauthorizedException('Invalid password!!!');
    }

    const tokenPayload = {
      email: payload?.email,
      userId: userData?.id,
      role: userData?.role,
      employeeId: userData.employee?.id ?? null,
    };

    const accessToken = await this.jwtService.signAsync(tokenPayload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: '1h',
    });

    const refreshToken = await this.jwtService.signAsync(tokenPayload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };

    //
  }

  // ! for creating employee

  //
}
