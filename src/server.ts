import express, { Request, Response } from 'express'; // وارد کردن تایپ‌های express
import multer from 'multer';
import path from 'path';
import dotenv from 'dotenv';

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
