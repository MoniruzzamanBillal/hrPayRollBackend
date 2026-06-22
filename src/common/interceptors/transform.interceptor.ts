import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Response } from 'express';
import { map, Observable } from 'rxjs';

interface ResponseData {
  message?: string;
  result?: unknown;
  [key: string]: unknown;
}

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Record<string, unknown>> {
    return next.handle().pipe(
      map((data: unknown) => {
        const response = context.switchToHttp().getResponse<Response>();
        const responseData = data as ResponseData;
        return {
          success: true,
          statusCode: response.statusCode,
          message: responseData.message || 'Request successful',
          data: responseData.result ?? data,
        };
      }),
    );
  }
}
