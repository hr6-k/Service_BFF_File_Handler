

import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import logger from './logger';
import pidusage from 'pidusage';
import os from 'os';
import { healthCheck_C } from './healthCheckController'; // Import the healthCheck_C function

dotenv.config();

const app = express();

// File storage configuration using Multer
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
  limits: { fileSize: 250 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'text/csv') {
      return cb(new Error('Only CSV files are allowed!'));
    }
    cb(null, true);
  }
});

interface CustomRequest extends Request {
  file?: Express.Multer.File;
}

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

// POST route for file upload
app.post('/upload', upload.single('file'), (req: CustomRequest, res: Response) => {
  requestQueue.push(() => {
    return new Promise((resolve, reject) => {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const fileName = req.file.filename;

      setTimeout(() => {
        res.json({ message: 'File uploaded successfully', filename: fileName });
        resolve({ message: 'File uploaded successfully', filename: fileName });
      }, 2000);
    });
  });

  processQueue();
});

// Health Check Route 1
app.get('/health', async (req: Request, res: Response) => {
  try {
    pidusage(process.pid, (err, stats) => {
      if (err) {
        return res.status(500).json({
          status: 'unhealthy',
          error: 'An issue occurred while checking the system status.',
        });
      }

      // Get system memory usage
      const memoryUsage = os.freemem();
      const totalMemory = os.totalmem();
      const memoryPercent = (memoryUsage / totalMemory) * 100;

      // Simulate external services status (this can be expanded)
      const externalServices = {
        database: 'healthy',
        anotherAPI: 'healthy',
      };

      res.json({
        status: 'healthy',
        cpuUsage: `${stats.cpu.toFixed(2)}%`,
        freeMemory: `${memoryPercent.toFixed(2)}%`,
        externalServices,
      });
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: 'An issue occurred while checking the system status.',
    });
  }
});

// Health Check Route 2 (with external service data)
app.get('/health-check', healthCheck_C);  // Register the healthCheck_C route

// Global error handler for Multer errors
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    res.status(500).json({ message: `Multer error: ${err.message}` });
  } else if (err) {
    res.status(500).json({ message: `Unknown error: ${err.message}` });
  } else {
    next();
  }
});

// Server initialization
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export { server }; // Export server for testing purposes
export default app;
