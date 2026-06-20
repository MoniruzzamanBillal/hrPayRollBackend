import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [JwtModule.register({})],
  providers: [AuthService, PrismaService],
  controllers: [AuthController],
  exports: [JwtModule],
})
export class AuthModule {}
