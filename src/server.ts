import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid'; // برای تولید request ID منحصر به فرد
import logger from './logger'; // وارد کردن logger

import { dynamicThrottling } from './dynamicThrottling';
import { healthCheck } from './healthCheck';
import { healthCheck_C } from './healthCheckController';
import { basicAuthentication } from './auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// تنظیمات ذخیره‌سازی فایل‌ها
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // ذخیره در پوشه uploads
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // نام‌گذاری فایل‌ها بر اساس زمان
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 250 * 1024 * 1024 }, // حداکثر حجم 250MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'text/csv') {
      return cb(new Error('Only CSV files are allowed!')); // فقط فایل‌های CSV مجاز هستند
    }
    cb(null, true);
  }
});

// تایپ‌دهی درست به `req` برای پشتیبانی از ویژگی `file`
interface CustomRequest extends Request {
  file?: Express.Multer.File;
}

// استفاده از میدل‌ور محدودسازی دینامیک
app.use(dynamicThrottling);

// مسیر بررسی سلامت سیستم
app.get('/health', healthCheck);
app.get('/health_C', healthCheck_C);

// محافظت از مسیرهای خاص با Basic Authentication
app.use('/secure', basicAuthentication);

// مسیر برای آپلود فایل
app.post('/upload', upload.single('file'), async (req: CustomRequest, res: Response): Promise<void> => {
  const requestId = uuidv4(); // ایجاد شناسه منحصر به فرد برای درخواست
  const startTime = Date.now(); // زمان شروع آپلود

  logger.info(`Request ${requestId} started`, { method: req.method, path: req.path });

  if (!req.file) {
    logger.error(`Request ${requestId} failed: No file uploaded`);
    res.status(400).json({ message: 'No file uploaded' });
    return;
  }

  // اطلاعات فایل آپلود شده
  const fileName = req.file.filename;
  const fileSize = req.file.size;
  const endTime = Date.now(); // زمان پایان آپلود
  const duration = endTime - startTime; // مدت زمان پردازش درخواست

  // ثبت متریک‌ها
  logger.info(`Request ${requestId} completed`, {
    fileName: fileName,
    fileSize: fileSize,
    duration: duration,
    status: 'success',
  });

  res.json({ message: 'File uploaded successfully', filename: fileName });
});

// میدل‌ور برای مدیریت خطاها
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    res.status(500).json({ message: `Multer error: ${err.message}` }); // خطای Multer
  } else if (err) {
    res.status(500).json({ message: `Unknown error: ${err.message}` }); // خطای عمومی
  } else {
    next();
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
