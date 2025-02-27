// import express, { Request, Response, NextFunction } from 'express';
// import multer from 'multer';
// import path from 'path';
// import dotenv from 'dotenv';
// import { v4 as uuidv4 } from 'uuid'; 
// import logger from './logger'; 

// import { dynamicThrottling } from './dynamicThrottling';
// import { healthCheck } from './healthCheck';
// import { healthCheck_C } from './healthCheckController';
// import { basicAuthentication } from './auth';

// dotenv.config();

// const app = express();

// // تنظیمات ذخیره‌سازی فایل‌ها
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
//   limits: { fileSize: 250 * 1024 * 1024 },
//   fileFilter: (req, file, cb) => {
//     if (file.mimetype !== 'text/csv') {
//       return cb(new Error('Only CSV files are allowed!'));
//     }
//     cb(null, true);
//   }
// });

// // تایپ‌دهی درست به `req` برای پشتیبانی از ویژگی `file`
// interface CustomRequest extends Request {
//   file?: Express.Multer.File;
// }

// // استفاده از میدل‌ور محدودسازی دینامیک
// app.use(dynamicThrottling);

// // مسیر بررسی سلامت سیستم
// app.get('/health', healthCheck);
// app.get('/health_C', healthCheck_C);

// // محافظت از مسیرهای خاص با Basic Authentication
// app.use('/secure', basicAuthentication);













// // مسیر برای آپلود فایل
// app.post('/upload', upload.single('file'), async (req: CustomRequest, res: Response): Promise<void> => {
//   const requestId = uuidv4();
//   const startTime = Date.now();

//   logger.info(`Request ${requestId} started`, { method: req.method, path: req.path });

//   if (!req.file) {
//     logger.error(`Request ${requestId} failed: No file uploaded`);
//     res.status(400).json({ message: 'No file uploaded' });
//     return;
//   }

//   const fileName = req.file.filename;
//   const fileSize = req.file.size;
//   const endTime = Date.now();
//   const duration = endTime - startTime;

//   logger.info(`Request ${requestId} completed`, {
//     fileName: fileName,
//     fileSize: fileSize,
//     duration: duration,
//     status: 'success',
//   });

//   res.json({ message: 'File uploaded successfully', filename: fileName });
// });

// // میدل‌ور برای مدیریت خطاها
// app.use((err: any, req: Request, res: Response, next: NextFunction) => {
//   if (err instanceof multer.MulterError) {
//     res.status(500).json({ message: `Multer error: ${err.message}` });
//   } else if (err) {
//     res.status(500).json({ message: `Unknown error: ${err.message}` });
//   } else {
//     next();
//   }
// });

// export default app;




import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import logger from './logger';

dotenv.config();

const app = express();

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
  limits: { fileSize: 250 * 1024 * 1024 }, // محدودیت اندازه فایل
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

// محدودیت همزمانی با استفاده از صف درخواست‌ها
const MAX_CONCURRENT_REQUESTS = 5;
let currentRequests = 0;
const requestQueue: any[] = [];

const processQueue = () => {
  if (currentRequests < MAX_CONCURRENT_REQUESTS && requestQueue.length > 0) {
    const nextRequest = requestQueue.shift();
    currentRequests++;

    nextRequest().then(() => {
      currentRequests--;
      processQueue();
    }).catch(() => {
      currentRequests--;
      processQueue();
    });
  }
};

app.post('/upload', upload.single('file'), (req: CustomRequest, res: Response) => {
  requestQueue.push(() => {
    return new Promise((resolve, reject) => {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const fileName = req.file.filename;
      const fileSize = req.file.size;

      // انجام پردازش فایل
      setTimeout(() => {
        res.json({ message: 'File uploaded successfully', filename: fileName });
        resolve({ message: 'File uploaded successfully', filename: fileName }); // ارسال شیء به resolve
      }, 2000); // فرض کنید که پردازش 2 ثانیه طول می‌کشد
    });
  });

  processQueue(); // پردازش صف درخواست‌ها
});

// میدل‌ور برای مدیریت خطاها
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    res.status(500).json({ message: `Multer error: ${err.message}` });
  } else if (err) {
    res.status(500).json({ message: `Unknown error: ${err.message}` });
  } else {
    next();
  }
});

export default app;

