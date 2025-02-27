import express, { Request, Response } from 'express'; // وارد کردن تایپ‌های express
import multer from 'multer';
import path from 'path';
import dotenv from 'dotenv';

import { dynamicThrottling } from './dynamicThrottling'; // ایمپورت میدل‌ور محدودسازی دینامیک
import { healthCheck } from './healthCheck';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// تنظیمات ذخیره‌سازی فایل‌ها
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 250 * 1024 * 1024 }, // حداکثر حجم 250MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'text/csv') {
      return cb(new Error('Only CSV files are allowed!'));
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

// تغییر در تابع handler: به جای برگرداندن Response، از Promise<void> استفاده می‌کنیم.
app.post('/upload', upload.single('file'), async (req: CustomRequest, res: Response): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ message: 'No file uploaded' });
    return;
  }
  res.json({ message: 'File uploaded successfully', filename: req.file.filename });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


// // src/server.ts
// import express, { Request, Response } from 'express';
// import multer from 'multer';
// import path from 'path';
// import dotenv from 'dotenv';
// import { dynamicThrottling } from './dynamicThrottling'; // ایمپورت میدل‌ور محدودسازی دینامیک

// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 3000;

// // تنظیم مسیر ذخیره‌سازی فایل‌ها
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/');
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname));
//   }
// });

// const upload = multer({
//   storage: storage,
//   limits: { fileSize: 250 * 1024 * 1024 }, // حداکثر حجم 250MB
//   fileFilter: (req, file, cb) => {
//     if (file.mimetype !== 'text/csv') {
//       return cb(new Error('فقط فایل‌های CSV مجاز هستند!'));
//     }
//     cb(null, true);
//   }
// });

// // استفاده از میدل‌ور محدودسازی دینامیک
// app.use(dynamicThrottling);

// // مسیر آپلود فایل
// app.post('/upload', upload.single('file'), (req: Request, res: Response) => {
//   if (!req.file) {
//     return res.status(400).json({ message: 'هیچ فایلی آپلود نشده است' });
//   }
//   res.json({ message: 'فایل با موفقیت آپلود شد', filename: req.file.filename });
// });

// app.listen(PORT, () => {
//   console.log(`سرور در پورت ${PORT} در حال اجرا است`);
// });
