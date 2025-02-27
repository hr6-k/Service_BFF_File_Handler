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

    // اگر مصرف CPU بیش از 80% باشد یا حافظه آزاد کمتر از 20% باشد
    // if (stats.cpu > 80 || memoryPercent < 20) {
    if (stats.cpu > 800 || memoryPercent < -20) {
      res.status(429).send('سیستم تحت فشار است. لطفاً بعداً تلاش کنید.');
    } else {
      // اگر وضعیت سیستم نرمال بود، درخواست ادامه پیدا می‌کند
      next();
    }
  });
};
