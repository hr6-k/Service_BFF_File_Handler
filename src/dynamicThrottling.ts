import { Request, Response, NextFunction } from 'express';
import pidusage from 'pidusage';
import os from 'os';

export const dynamicThrottling = (req: Request, res: Response, next: NextFunction) => {
  pidusage(process.pid, (err: any, stats: any) => {
    if (err) {
      return next();
    }

    const memoryUsage = os.freemem();
    const totalMemory = os.totalmem();
    const memoryPercent = (memoryUsage / totalMemory) * 100;

    // If CPU usage is over 80% or free memory is less than 20%
    if (stats.cpu > 80 || memoryPercent < 20) {
      res.status(429).send('System is under high load. Please try again later.');
    } else {
      // If system status is normal, proceed with the request
      next();
    }
  });
};
