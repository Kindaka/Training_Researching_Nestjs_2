import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import * as Transport from 'winston-transport';
import { ConfigService } from '@nestjs/config';

// Custom Transport cho Seq
class SeqTransport extends Transport {
  private seqUrl: string;
  private apiKey: string;
  private hasLoggedError = false;

  constructor(opts: any) {
    super(opts);
    this.seqUrl = opts.seqUrl;
    this.apiKey = opts.apiKey;
  }

  async log(info: any, callback: () => void) {
    setImmediate(() => {
      this.emit('logged', info);
    });

    const { level, message, ...meta } = info;
    
    // Kiểm tra nếu không có URL hoặc API key
    if (!this.seqUrl || !this.apiKey) {
      console.warn('Seq logging disabled: Missing URL or API key');
      callback();
      return;
    }
    
    try {
      await fetch(`${this.seqUrl}/api/events/raw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Seq-ApiKey': this.apiKey
        },
        body: JSON.stringify({
          Events: [{
            Timestamp: new Date().toISOString(),
            Level: level.toUpperCase(),
            MessageTemplate: message,
            Properties: meta
          }]
        })
      });
    } catch (error) {
      // Chỉ log lỗi một lần để tránh spam console
      if (!this.hasLoggedError) {
        console.error('Error sending log to Seq. Further Seq errors will be suppressed:', error);
        this.hasLoggedError = true;
      }
    }

    callback();
  }
}

@Injectable()
export class CustomLoggerService implements LoggerService {
  private logger: winston.Logger;

  constructor(private configService: ConfigService) {
    const { combine, timestamp, printf, colorize, json } = winston.format;
    
    // Format chi tiết với metadata
    const logFormat = printf(({ level, message, timestamp, ...metadata }) => {
      let metaStr = '';
      if (Object.keys(metadata).length > 0) {
        metaStr = `\nMetadata: ${JSON.stringify(metadata, null, 2)}`;
      }
      return `${timestamp} [${level}]: ${message}${metaStr}`;
    });

    // Transport cho file thông thường
    const fileTransport = new winston.transports.DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d',
      maxSize: '20m',
      format: combine(
        timestamp(),
        json()
      )
    });

    // Transport cho error
    const errorFileTransport = new winston.transports.DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d',
      maxSize: '20m',
      level: 'error',
      format: combine(
        timestamp(),
        json()
      )
    });

    // Transport cho Seq
    const seqTransport = new SeqTransport({
      level: 'info',
      seqUrl: this.configService.get('SEQ_URL') || 'http://localhost:5341',
      apiKey: this.configService.get('SEQ_API_KEY')
    });

    this.logger = winston.createLogger({
      level: 'debug',
      format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
      ),
      transports: [
        new winston.transports.Console({
          format: combine(
            colorize(),
            timestamp(),
            logFormat
          )
        }),
        fileTransport,
        errorFileTransport,
        seqTransport
      ]
    });
  }

  log(message: string, metadata?: any) {
    this.logger.info(message, metadata);
  }

  error(message: string, metadata?: any) {
    this.logger.error(message, metadata);
  }

  warn(message: string, metadata?: any) {
    this.logger.warn(message, metadata);
  }

  debug(message: string, metadata?: any) {
    this.logger.debug(message, metadata);
  }

  verbose(message: string, metadata?: any) {
    this.logger.verbose(message, metadata);
  }
} 