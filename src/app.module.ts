import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { ProjectModule } from './modules/project/project.module';
import { UserModule } from './modules/user/user.module';
import { ProductModule } from './modules/product/product.module';
import { AiIntegrationModule } from './modules/ai-integration/ai-integration.module';
import { loggerConfig } from './core/logger/winston.config';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    WinstonModule.forRoot(loggerConfig),
    UserModule,
    AuthModule,
    ProjectModule,
    ProductModule,
    AiIntegrationModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AllExceptionsFilter,
    LoggingInterceptor,
    TransformInterceptor,
    JwtAuthGuard,
    RolesGuard,
  ],
})
export class AppModule {}
