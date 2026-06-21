import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { DesignationController } from './designation.controller';
import { DesignationService } from './designation.service';

@Module({
  controllers: [DesignationController],
  providers: [DesignationService, PrismaService],
})
export class DesignationModule {}
