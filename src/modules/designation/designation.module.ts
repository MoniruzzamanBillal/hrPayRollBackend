import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { DesignationController } from './designation.controller';
import { DesignationService } from './designation.service';

@Module({
  imports: [PrismaModule],
  controllers: [DesignationController],
  providers: [DesignationService],
})
export class DesignationModule {}
