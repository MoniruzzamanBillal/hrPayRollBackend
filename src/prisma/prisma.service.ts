import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { PrismaClient } from 'src/generated/prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL as string,
    });
    super({ adapter });

    const client = this as unknown as {
      $on: (
        event: string,
        callback: (e: {
          query?: string;
          params?: string;
          duration?: number;
          message?: string;
          target?: string;
        }) => void,
      ) => void;
    };

    if (process.env.NODE_ENV === 'development') {
      client.$on('query', (e) => {
        this.logger.debug('Prisma Query', {
          query: e.query,
          params: e.params,
          duration: `${e.duration}ms`,
        });
      });
    }

    client.$on('error', (e) => {
      this.logger.error('Prisma Error', {
        message: e.message,
        target: e.target,
      });
    });

    client.$on('warn', (e) => {
      this.logger.warn('Prisma Warning', {
        message: e.message,
        target: e.target,
      });
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
