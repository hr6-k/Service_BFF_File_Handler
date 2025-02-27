import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import logger from './logger';

dotenv.config();

const app = express();

// File storage configuration
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
  limits: { fileSize: 250 * 1024 * 1024 }, // File size limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'text/csv') {
      return cb(new Error('Only CSV files are allowed!'));
    }
    cb(null, true);
  }
});

// Correct typing for `req` to support the `file` property
interface CustomRequest extends Request {
  file?: Express.Multer.File;
}

// Concurrency limit using request queue
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

      // Process the uploaded file
      setTimeout(() => {
        res.json({ message: 'File uploaded successfully', filename: fileName });
        resolve({ message: 'File uploaded successfully', filename: fileName }); // Resolve with success message
      }, 2000); // Assume processing takes 2 seconds
    });
  });

  processQueue(); // Process the request queue
});

// Middleware for error handling
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
