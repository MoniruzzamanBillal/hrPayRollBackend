import { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const logDir = 'logs';

export const loggerConfig: WinstonModuleOptions = {
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  defaultMeta: { service: 'nestjs-app' },
  transports: [
    new winston.transports.Console({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp, context, ...meta }) => {
          const ctx = typeof context === 'string' ? context : 'App';
          const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
          return `${String(timestamp)} [${ctx}] ${String(level)}: ${String(message)} ${metaStr}`;
        }),
      ),
    }),
    new DailyRotateFile({
      dirname: logDir,
      filename: 'application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
      level: 'info',
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    }),
    new DailyRotateFile({
      dirname: logDir,
      filename: 'error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '90d',
      level: 'error',
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    }),
  ],
};
