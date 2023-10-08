import { Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger();
  use(req: Request, res: Response, next: NextFunction) {
    const startAt = process.hrtime();
    const { method, originalUrl } = req;
    this.logger.log(`${method} --> ${originalUrl}`);

    res.on('finish', () => {
      const { statusCode } = res;
      const diff = process.hrtime(startAt);
      const responseTime = Math.round(diff[0] * 1e3 + diff[1] * 1e-6);
      this.logger.log(
        `${method} ${statusCode} ${responseTime}ms <-- ${originalUrl}`,
      );
    });
    next();
  }
}