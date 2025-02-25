import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

@Injectable()
export class CustomLoggerService implements LoggerService {
  private logger: winston.Logger;

  constructor() {
    // Định dạng log
    const { combine, timestamp, printf, colorize } = winston.format;
    
    // Format chi tiết hơn với thêm trace
    const logFormat = printf(({ level, message, timestamp, trace }) => {
      return `${timestamp} [${level}]: ${message}${trace ? `\n${trace}` : ''}`;
    });

    // Transport cho file thông thường
    const fileTransport = new winston.transports.DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d', // Giữ log trong 14 ngày
      maxSize: '20m',  // Mỗi file tối đa 20MB
      level: 'debug', // Thay đổi level thành debug
    });

    // Transport riêng cho error
    const errorFileTransport = new winston.transports.DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d',
      maxSize: '20m',
      level: 'error',
    });

    // Tạo logger
    this.logger = winston.createLogger({
      level: 'debug', // Thay đổi default level thành debug
      format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
      ),
      transports: [
        // Ghi ra console
        new winston.transports.Console({
          format: combine(
            colorize(),
            timestamp(),
            logFormat
          ),
          level: 'debug', // Thay đổi console level thành debug
        }),
        // Ghi ra file
        fileTransport,
        errorFileTransport, // Thêm transport riêng cho error
      ],
    });
  }

  log(message: string, trace?: string) {
    this.logger.info(message, { trace });
  }

  error(message: string, trace?: string) {
    this.logger.error(message, { trace });
  }

  warn(message: string, trace?: string) {
    this.logger.warn(message, { trace });
  }

  debug(message: string, trace?: string) {
    this.logger.debug(message, { trace });
  }

  verbose(message: string, trace?: string) {
    this.logger.verbose(message, { trace });
  }
} 