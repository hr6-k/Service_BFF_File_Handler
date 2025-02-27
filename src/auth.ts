import dotenv from 'dotenv';
dotenv.config(); // باید در ابتدای کد قرار بگیرد

import { Request, Response, NextFunction } from 'express';
import basicAuth from 'basic-auth';
import bcrypt from 'bcrypt';

// چاپ مقادیر متغیرهای محیطی برای بررسی
console.log('BASIC_AUTH_USERNAME:', process.env.BASIC_AUTH_USERNAME);
console.log('BASIC_AUTH_PASSWORD:', process.env.BASIC_AUTH_PASSWORD);

const USERS = {
  username: process.env.BASIC_AUTH_USERNAME || 'default-username',
  password: process.env.BASIC_AUTH_PASSWORD || 'default-password'
};

export const basicAuthentication = (req: Request, res: Response, next: NextFunction): void => {
  const user = basicAuth(req);

  console.log('Received user:', user); // چاپ مقادیر دریافت شده

  if (!user || user.name !== USERS.username || !bcrypt.compareSync(user.pass, USERS.password)) {
    console.log('Unauthorized access attempt');
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  next();
};
