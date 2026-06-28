import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { WinstonModule } from 'nest-winston';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { loggerConfig } from './core/logger/winston.config';
import { AiIntegrationModule } from './modules/ai-integration/ai-integration.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { AuthModule } from './modules/auth/auth.module';
import { DepartmentModule } from './modules/department/department.module';
import { DesignationModule } from './modules/designation/designation.module';
import { EmployeeModule } from './modules/employee/employee.module';
import { LeaveBalanceModule } from './modules/leave-balance/leave-balance.module';
import { LeaveRequestModule } from './modules/leave-request/leave-request.module';
import { LeaveTypeModule } from './modules/leave-type/leave-type.module';
import { PayrollModule } from './modules/payroll/payroll.module';
import { SalaryComponentModule } from './modules/salary-component/salary-component.module';
import { SalaryStructureModule } from './modules/salary-structure/salary-structure.module';
import { UserModule } from './modules/user/user.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.register({ global: true }),
    WinstonModule.forRoot(loggerConfig),
    UserModule,
    AuthModule,
    PrismaModule,

    AiIntegrationModule,

    DepartmentModule,

    DesignationModule,

    EmployeeModule,

    AttendanceModule,

    LeaveRequestModule,

    LeaveTypeModule,

    LeaveBalanceModule,

    SalaryComponentModule,

    SalaryStructureModule,

    PayrollModule,
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
  exports: [JwtModule],
})
export class AppModule {}
