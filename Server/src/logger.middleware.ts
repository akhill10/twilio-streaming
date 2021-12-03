import { Body, Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction): void {
    const { method, originalUrl } = request;

    response.on('finish', () => {
      const { statusCode, statusMessage } = response;
      this.logger.log(
        `${method} ${originalUrl} ${statusCode} ${statusMessage}`,
      );
    });

    next();
  }
}
