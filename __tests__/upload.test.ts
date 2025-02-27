

import request from 'supertest';
import app, { server } from '../src/server'; // Importing the main server for the test
import fs from 'fs';
import path from 'path';

describe('Upload API', () => {
  // Close the server after all tests are complete
  afterAll((done) => {
    server.close(done); // This will stop the server
  });

  // Test case to upload a valid CSV file
  it('should successfully upload a valid CSV file', async () => {
    const filePath = path.join(__dirname, 'test.csv'); 
    fs.writeFileSync(filePath, 'name,age\nJohn,30\nDoe,25'); 

    const response = await request(app)
      .post('/upload')
      .attach('file', filePath);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('filename');

    fs.unlinkSync(filePath);
  });

  // Test case to reject an invalid file type (non-CSV)
  it('should reject an invalid file type', async () => {
    const response = await request(app)
      .post('/upload')
      .attach('file', Buffer.from('This is not a CSV'), 'test.txt');

    expect(response.status).toBe(500);
    expect(response.body.message).toContain('Only CSV files are allowed!');
  });

  // Test case to handle the case when no file is uploaded
  it('should return an error when no file is uploaded', async () => {
    const response = await request(app).post('/upload');

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('No file uploaded');
  });

  // Test case to check the processing of both small and large CSV files
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

  // Test case to check throttling of upload speed under heavy load
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
    expect(duration).toBeLessThan(10000);

    fs.unlinkSync(filePath);
  });

  // Test case to handle large CSV file uploads concurrently
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

  // Test case to limit the number of concurrent requests
  it('should limit concurrent requests to 5', async () => {
    const filePath = path.join(__dirname, 'test.csv'); 
    fs.writeFileSync(filePath, 'name,age\nJohn,30\nDoe,25');

    const requests = [];
    for (let i = 0; i < 10; i++) {
      requests.push(request(app).post('/upload').attach('file', filePath));
    }

    const startTime = Date.now();

    const responses = await Promise.all(requests);

    const endTime = Date.now();
    const duration = endTime - startTime;

    responses.forEach((response) => {
      expect(response.status).toBe(200);
    });

    expect(duration).toBeGreaterThan(5000);

    fs.unlinkSync(filePath);
  }, 10000);
});
