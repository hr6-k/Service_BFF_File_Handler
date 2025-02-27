import winston from 'winston';

const logger = winston.createLogger({
  level: 'info', 
  format: winston.format.combine(
    winston.format.timestamp(), //
    winston.format.printf(({ timestamp, level, message, ...metadata }) => {
      return `${timestamp} ${level}: ${message} ${
        metadata && Object.keys(metadata).length ? JSON.stringify(metadata) : ''
      }`;
    })
  ),
  transports: [
    new winston.transports.Console({ format: winston.format.simple() }), 
    new winston.transports.File({ filename: 'logs/application.log' }), 
  ],
});

export default logger;
