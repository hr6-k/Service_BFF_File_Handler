import express, { Request, Response, NextFunction } from 'express'; // وارد کردن تایپ‌های express
import multer from 'multer';
import path from 'path';
import dotenv from 'dotenv';

import { dynamicThrottling } from './dynamicThrottling'; // ایمپورت میدل‌ور محدودسازی دینامیک
import { healthCheck } from './healthCheck';
import { healthCheck_C } from './healthCheckController'; // وارد کردن کنترلر health check
import { basicAuthentication } from './auth';  // ایمپورت میدل‌ور

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

// پیکربندی مسیر health check
app.get('/health_C', healthCheck_C);



// // مسیر امن برای تست
// app.get('/secure', (req, res) => {
//   res.send('Welcome to the secure area!');
// });

// محافظت از مسیرهای خاص با Basic Authentication
app.use('/secure', basicAuthentication);

// یک مسیر امن برای تست میدل‌ور
app.get('/secure/protected-resource', (req, res) => {
  res.send('این یک منبع محافظت‌شده است');
});







// تغییر در تابع handler: به جای برگرداندن Response، از Promise<void> استفاده می‌کنیم.
app.post('/upload', upload.single('file'), async (req: CustomRequest, res: Response): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ message: 'No file uploaded' }); // اگر فایلی آپلود نشد
    return;
  }
  res.json({ message: 'File uploaded successfully', filename: req.file.filename }); // فایل با موفقیت آپلود شد
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
