import axios from 'axios';
import axiosRetry from 'axios-retry';
import CircuitBreaker from 'opossum';

// Configure axios for retry with exponential backoff
axiosRetry(axios, {
  retries: 5, // Maximum number of retry attempts
  retryDelay: axiosRetry.exponentialDelay, // Exponential delay between retries
  shouldRetry: (error: any) => { // Set error type to `any`
    // Retry only for network errors or 5xx server errors
    return error.code === 'ECONNABORTED' || error.response?.status >= 500;
  },
} as any); // Cast to `any` to prevent type errors

// Create a Circuit Breaker for the external service
const breaker = new CircuitBreaker(
  async () => {
    // Make a request to an external API (Replace URL with actual service)
    const response = await axios.get('https://some-external-api.com');
    return response.data;
  },
  {
    timeout: 5000, // Timeout for the request to the service
    errorThresholdPercentage: 50, // Error threshold percentage before tripping the circuit
    resetTimeout: 30000, // Time after which the circuit breaker resets
  }
);

// Function to fetch data from the external service with retry and circuit breaker
export const getExternalData = async () => {
  try {
    // Use the circuit breaker to make a request to the external service
    const externalData = await breaker.fire();
    return externalData;
  } catch (error) {
    // If an error occurs, return a descriptive error message
    throw new Error('External service is unavailable');
  }
};
