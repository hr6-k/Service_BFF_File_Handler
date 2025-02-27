import { Request, Response } from 'express';
import { getExternalData } from './externalService';  // وارد کردن تابع سرویس

// مدیریت درخواست health check
export const healthCheck_C = async (req: Request, res: Response) => {
  try {
    // دریافت داده‌ها از سرویس خارجی با استفاده از retry و مدار شکن
    const externalData = await getExternalData();

    // پاسخ با وضعیت سلامت سیستم و داده‌های سرویس خارجی
    res.json({
      status: 'healthy',  // وضعیت کلی سلامت سیستم
      externalServiceData: externalData,  // داده‌های سرویس خارجی
    });
  } catch (error) {
    // در صورت بروز خطا، وضعیت "unhealthy" را ارسال می‌کنیم
    res.status(500).json({
      status: 'unhealthy',
      error: 'مشکلی در بررسی وضعیت سیستم یا سرویس‌های خارجی رخ داده است.',
    });
  }
};
