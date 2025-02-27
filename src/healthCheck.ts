import { Request, Response } from 'express';
import pidusage from 'pidusage';
import os from 'os';

// Check the system health status
export const healthCheck = async (req: Request, res: Response) => {
  try {
    // Get CPU usage information for the current process
    pidusage(process.pid, (err, stats) => {
      if (err) {
        return res.status(500).json({
          status: 'unhealthy',
          error: 'An issue occurred while checking the system status.',
        });
      }

      // Get free memory and total memory
      const memoryUsage = os.freemem();
      const totalMemory = os.totalmem();
      const memoryPercent = (memoryUsage / totalMemory) * 100;

      // Check the health of external services
      const externalServices = {
        database: 'healthy', // This value should be checked dynamically
        anotherAPI: 'healthy', // Perform an actual check here
      };

      res.json({
        status: 'healthy', // Overall system status
        cpuUsage: `${stats.cpu.toFixed(2)}%`, // CPU usage percentage
        freeMemory: `${memoryPercent.toFixed(2)}%`, // Free memory percentage
        externalServices, // Status of external services
      });
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: 'An issue occurred while checking the system status.',
    });
  }
};
