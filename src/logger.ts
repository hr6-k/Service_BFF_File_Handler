import winston from 'winston';

// ساخت لاگر با استفاده از winston
const logger = winston.createLogger({
  level: 'info', // سطح لاگ‌ها (اطلاعات عمومی)
  format: winston.format.combine(
    winston.format.timestamp(), // افزودن timestamp به هر لاگ
    winston.format.printf(({ timestamp, level, message, ...metadata }) => {
      return `${timestamp} ${level}: ${message} ${
        metadata && Object.keys(metadata).length ? JSON.stringify(metadata) : ''
      }`;
    })
  ),
  transports: [
    new winston.transports.Console({ format: winston.format.simple() }), // نمایش لاگ‌ها در کنسول
    new winston.transports.File({ filename: 'logs/application.log' }), // ذخیره‌سازی لاگ‌ها در فایل
  ],
});

export default logger;
