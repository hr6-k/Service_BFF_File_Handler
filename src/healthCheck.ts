// import { Request, Response } from 'express';
// import pidusage from 'pidusage'; // ایمپورت صحیح
// import os from 'os';
// import { promisify } from 'util';

// // تبدیل pidusage به نسخه Promise
// const pidusageAsync = promisify(pidusage);

// // تعریف تایپ صحیح برای داده‌های `pidusage`
// interface PidUsageStats {
//   cpu: number;
//   memory: number;
// }

// // بررسی وضعیت سلامت سیستم
// export const healthCheck = async (req: Request, res: Response) => {
//   try {
//     // دریافت اطلاعات مصرف CPU برای پردازش جاری
//     const stats: PidUsageStats = await pidusageAsync(process.pid);
    
//     // دریافت میزان حافظه آزاد و کل حافظه
//     const memoryUsage = os.freemem();
//     const totalMemory = os.totalmem();
//     const memoryPercent = (memoryUsage / totalMemory) * 100;

//     // بررسی سلامت سرویس‌های خارجی (می‌توانید مقدار را داینامیک تغییر دهید)
//     const externalServices = {
//       database: 'healthy', // این مقدار باید بررسی شود
//       anotherAPI: 'healthy', // بررسی واقعی لازم است
//     };

//     res.json({
//       status: 'healthy', // وضعیت کلی سیستم
//       cpuUsage: `${stats.cpu.toFixed(2)}%`, // میزان مصرف CPU
//       freeMemory: `${memoryPercent.toFixed(2)}%`, // میزان حافظه آزاد
//       externalServices, // وضعیت سرویس‌های خارجی
//     });
//   } catch (error) {
//     res.status(500).json({
//       status: 'unhealthy',
//       error: 'مشکلی در بررسی وضعیت سیستم رخ داده است.',
//     });
//   }
// };

import { Request, Response } from 'express';
import pidusage from 'pidusage';
import os from 'os';

// بررسی وضعیت سلامت سیستم
export const healthCheck = async (req: Request, res: Response) => {
  try {
    // دریافت اطلاعات مصرف CPU برای پردازش جاری
    pidusage(process.pid, (err, stats) => {
      if (err) {
        return res.status(500).json({
          status: 'unhealthy',
          error: 'مشکلی در بررسی وضعیت سیستم رخ داده است.',
        });
      }

      // دریافت میزان حافظه آزاد و کل حافظه
      const memoryUsage = os.freemem();
      const totalMemory = os.totalmem();
      const memoryPercent = (memoryUsage / totalMemory) * 100;

      // بررسی سلامت سرویس‌های خارجی
      const externalServices = {
        database: 'healthy', // این مقدار باید بررسی شود
        anotherAPI: 'healthy', // بررسی واقعی لازم است
      };

      res.json({
        status: 'healthy', // وضعیت کلی سیستم
        cpuUsage: `${stats.cpu.toFixed(2)}%`, // میزان مصرف CPU
        freeMemory: `${memoryPercent.toFixed(2)}%`, // میزان حافظه آزاد
        externalServices, // وضعیت سرویس‌های خارجی
      });
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: 'مشکلی در بررسی وضعیت سیستم رخ داده است.',
    });
  }
};
