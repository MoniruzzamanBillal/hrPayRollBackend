import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { map, Observable, tap } from 'rxjs';
import { Logger } from 'winston';

interface RequestInfo {
  method: string;
  url: string;
  query: Record<string, unknown>;
  params: Record<string, unknown>;
  body: Record<string, unknown>;
  ip: string;
  headers: Record<string, unknown>;
}

interface LogMeta {
  requestId: string;
  method: string;
  url: string;
  statusCode?: number;
  responseTime?: string;
  query?: Record<string, unknown>;
  params?: Record<string, unknown>;
  body?: Record<string, unknown>;
  ip?: string;
  userAgent?: unknown;
  error?: string;
  stack?: string;
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request>();
    const { method, url, query, params, body, ip, headers } =
      req as RequestInfo;
    const start = Date.now();
    const requestId =
      (headers['x-request-id'] as string) ||
      `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    this.logger.info('Incoming request', {
      requestId,
      method,
      url,
      query: this.sanitize(query),
      params: this.sanitize(params),
      body: this.sanitize(body),
      ip: ip || (headers['x-forwarded-for'] as string) || 'unknown',
      userAgent: headers['user-agent'],
    } as LogMeta);

    return next.handle().pipe(
      map((data: unknown) => {
        const res = context.switchToHttp().getResponse<Response>();
        const responseTime = Date.now() - start;

        this.logger.info('Response sent', {
          requestId,
          method,
          url,
          statusCode: res.statusCode,
          responseTime: `${responseTime}ms`,
        } as LogMeta);

        return data;
      }),
      tap({
        error: (error: {
          status?: number;
          message?: string;
          stack?: string;
        }) => {
          const responseTime = Date.now() - start;
          this.logger.error('Request error', {
            requestId,
            method,
            url,
            statusCode: error.status || 500,
            responseTime: `${responseTime}ms`,
            error: error.message,
            stack: error.stack,
          } as LogMeta);
        },
      }),
    );
  }

  private sanitize(
    obj: Record<string, unknown> | unknown[] | undefined,
  ): Record<string, unknown> | unknown[] | undefined {
    if (!obj || typeof obj !== 'object') return obj;
    const sensitiveKeys = [
      'password',
      'token',
      'secret',
      'authorization',
      'creditcard',
      'cvv',
      'ssn',
      'apikey',
      'api_key',
      'access_token',
      'refresh_token',
      'jwt',
      'bearer',
    ];
    const clone = Array.isArray(obj)
      ? [...obj]
      : ({ ...obj } as Record<string, unknown>);
    for (const key of Object.keys(clone)) {
      const lowerKey = key.toLowerCase();
      if (sensitiveKeys.some((s) => lowerKey.includes(s))) {
        clone[key] = '***REDACTED***';
      } else if (typeof clone[key] === 'object' && clone[key] !== null) {
        clone[key] = this.sanitize(clone[key] as Record<string, unknown>);
      }
    }
    return clone;
  }
}
