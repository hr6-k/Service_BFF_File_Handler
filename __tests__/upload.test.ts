// import request from 'supertest';
// import app from '../src/server'; // ایمپورت سرور اصلی
// import fs from 'fs';
// import path from 'path';
// import rateLimit from 'express-rate-limit';

// describe('Upload API', () => {
//   it('should successfully upload a valid CSV file', async () => {
//     const filePath = path.join(__dirname, 'test.csv'); 
//     fs.writeFileSync(filePath, 'name,age\nJohn,30\nDoe,25'); // ایجاد یک فایل CSV آزمایشی

//     const response = await request(app)
//       .post('/upload')
//       .attach('file', filePath);

//     expect(response.status).toBe(200);
//     expect(response.body).toHaveProperty('filename');

//     fs.unlinkSync(filePath); // حذف فایل آزمایشی
//   });

//   it('should reject an invalid file type', async () => {
//     const response = await request(app)
//       .post('/upload')
//       .attach('file', Buffer.from('This is not a CSV'), 'test.txt');

//     expect(response.status).toBe(500);
//     expect(response.body.message).toContain('Only CSV files are allowed!');
//   });

//   it('should return an error when no file is uploaded', async () => {
//     const response = await request(app).post('/upload');

//     expect(response.status).toBe(400);
//     expect(response.body.message).toBe('No file uploaded');
//   });
// });



// // __________________
// // تست بارگذاری فایل‌های CSV با اندازه‌های مختلف

// it('باید فایل‌های CSV کوچک و بزرگ را به درستی بارگذاری کند', async () => {
//   const smallFilePath = path.join(__dirname, 'small-file.csv');
//   const largeFilePath = path.join(__dirname, 'large-file.csv');
  
//   const smallData = 'name,age\nJohn,30\nDoe,25';
//   const largeData = new Array(100000).fill('name,age\nJohn,30\nDoe,25').join('\n');

//   fs.writeFileSync(smallFilePath, smallData);
//   fs.writeFileSync(largeFilePath, largeData);

//   const smallResponse = await request(app)
//     .post('/upload')
//     .attach('file', smallFilePath);
  
//   const largeResponse = await request(app)
//     .post('/upload')
//     .attach('file', largeFilePath);

//   expect(smallResponse.status).toBe(200);
//   expect(largeResponse.status).toBe(200);

//   fs.unlinkSync(smallFilePath);
//   fs.unlinkSync(largeFilePath);
// });



// // __________________
// //  تست بررسی Dynamic Throttling

// it('باید در صورت بار زیاد، سرعت بارگذاری را به درستی کنترل کند', async () => {
//   const filePath = path.join(__dirname, 'large-file.csv');
//   const largeData = new Array(100000).fill('name,age\nJohn,30\nDoe,25').join('\n');
//   fs.writeFileSync(filePath, largeData);

//   const startTime = Date.now();
//   const response = await request(app)
//     .post('/upload')
//     .attach('file', filePath);
  
//   const endTime = Date.now();
//   const duration = endTime - startTime;

//   expect(response.status).toBe(200);
//   expect(duration).toBeLessThan(10000); // برای مثال، مدت زمان باید کمتر از 10 ثانیه باشد

//   fs.unlinkSync(filePath);
// });


// // __________________
// //  تست همزمانی بارگذاری فایل‌های CSV بزرگ (250MB)

// it('باید بتواند فایل‌های بزرگ CSV را به طور همزمان بارگذاری کند', async () => {
//   const filePath1 = path.join(__dirname, 'large-file1.csv');
//   const filePath2 = path.join(__dirname, 'large-file2.csv');

//   const largeData = new Array(100000).fill('name,age\nJohn,30\nDoe,25').join('\n');
  
//   fs.writeFileSync(filePath1, largeData);
//   fs.writeFileSync(filePath2, largeData);

//   const requests = [
//     request(app).post('/upload').attach('file', filePath1),
//     request(app).post('/upload').attach('file', filePath2)
//   ];

//   const responses = await Promise.all(requests);

//   responses.forEach(response => {
//     expect(response.status).toBe(200);
//     expect(response.body).toHaveProperty('filename');
//   });

//   fs.unlinkSync(filePath1);
//   fs.unlinkSync(filePath2);
// });




// // __________________
// // Rate Limiting
// const limiter = rateLimit({
//   windowMs: 10 * 1000, // 10 seconds
//   max: 1, // only 1 request per 10 seconds
//   message: 'Too many requests, please try again later.',
// });

// app.use(limiter); // Apply to all requests




// // __________________
// // Concurrency Limiting




import request from 'supertest';
import app from '../src/server'; // ایمپورت سرور اصلی
import fs from 'fs';
import path from 'path';

describe('Upload API', () => {
  it('should successfully upload a valid CSV file', async () => {
    const filePath = path.join(__dirname, 'test.csv'); 
    fs.writeFileSync(filePath, 'name,age\nJohn,30\nDoe,25'); // ایجاد یک فایل CSV آزمایشی

    const response = await request(app)
      .post('/upload')
      .attach('file', filePath);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('filename');

    fs.unlinkSync(filePath); // حذف فایل آزمایشی
  });

  it('should reject an invalid file type', async () => {
    const response = await request(app)
      .post('/upload')
      .attach('file', Buffer.from('This is not a CSV'), 'test.txt');

    expect(response.status).toBe(500);
    expect(response.body.message).toContain('Only CSV files are allowed!');
  });

  it('should return an error when no file is uploaded', async () => {
    const response = await request(app).post('/upload');

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('No file uploaded');
  });

  it('should process small and large CSV files correctly', async () => {
    const smallFilePath = path.join(__dirname, 'small-file.csv');
    const largeFilePath = path.join(__dirname, 'large-file.csv');
    
    const smallData = 'name,age\nJohn,30\nDoe,25';
    const largeData = new Array(100000).fill('name,age\nJohn,30\nDoe,25').join('\n');

    fs.writeFileSync(smallFilePath, smallData);
    fs.writeFileSync(largeFilePath, largeData);

    const smallResponse = await request(app)
      .post('/upload')
      .attach('file', smallFilePath);
    
    const largeResponse = await request(app)
      .post('/upload')
      .attach('file', largeFilePath);

    expect(smallResponse.status).toBe(200);
    expect(largeResponse.status).toBe(200);

    fs.unlinkSync(smallFilePath);
    fs.unlinkSync(largeFilePath);
  });

  it('should throttle upload speed under heavy load', async () => {
    const filePath = path.join(__dirname, 'large-file.csv');
    const largeData = new Array(100000).fill('name,age\nJohn,30\nDoe,25').join('\n');
    fs.writeFileSync(filePath, largeData);

    const startTime = Date.now();
    const response = await request(app)
      .post('/upload')
      .attach('file', filePath);
    
    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(response.status).toBe(200);
    expect(duration).toBeLessThan(10000); // مدت زمان باید کمتر از 10 ثانیه باشد

    fs.unlinkSync(filePath);
  });

  it('should handle large CSV file uploads concurrently', async () => {
    const filePath1 = path.join(__dirname, 'large-file1.csv');
    const filePath2 = path.join(__dirname, 'large-file2.csv');

    const largeData = new Array(100000).fill('name,age\nJohn,30\nDoe,25').join('\n');
    
    fs.writeFileSync(filePath1, largeData);
    fs.writeFileSync(filePath2, largeData);

    const requests = [
      request(app).post('/upload').attach('file', filePath1),
      request(app).post('/upload').attach('file', filePath2)
    ];

    const responses = await Promise.all(requests);

    responses.forEach(response => {
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('filename');
    });

    fs.unlinkSync(filePath1);
    fs.unlinkSync(filePath2);
  });

  // اضافه کردن تست همزمانی
  it('should limit concurrent requests to 5', async () => {
    const filePath = path.join(__dirname, 'test.csv'); 
    fs.writeFileSync(filePath, 'name,age\nJohn,30\nDoe,25');

    // ارسال 10 درخواست همزمان
    const requests = [];
    for (let i = 0; i < 10; i++) {
      requests.push(request(app).post('/upload').attach('file', filePath));
    }

    const startTime = Date.now();

    // ارسال همه درخواست‌ها به طور همزمان
    const responses = await Promise.all(requests);

    const endTime = Date.now();
    const duration = endTime - startTime;

    // بررسی وضعیت پاسخ‌ها
    responses.forEach((response) => {
      expect(response.status).toBe(200);
    });

    // مدت زمان باید بیشتر از 5 ثانیه باشد (چون فقط 5 درخواست همزمان پردازش می‌شود)
    expect(duration).toBeGreaterThan(5000);

    fs.unlinkSync(filePath);
  }, 10000); // افزایش تایم‌اوت برای این تست
});
