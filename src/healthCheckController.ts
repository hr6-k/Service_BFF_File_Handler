import { Request, Response } from 'express';
import { getExternalData } from './externalService';  // Import the external service function

// Handle health check request
export const healthCheck_C = async (req: Request, res: Response) => {
  try {
    // Fetch data from the external service using retry and circuit breaker
    const externalData = await getExternalData();

    // Respond with system health status and external service data
    res.json({
      status: 'healthy',  // Overall system health status
      externalServiceData: externalData,  // Data from the external service
    });
  } catch (error) {
    // If an error occurs, return an "unhealthy" status
    res.status(500).json({
      status: 'unhealthy',
      error: 'An issue occurred while checking system health or external services.',
    });
  }
};
