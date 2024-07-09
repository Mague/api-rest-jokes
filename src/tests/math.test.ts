import request from 'supertest';
import express from 'express';
import mathRoutes from '../routes/math';

// Configurar la aplicación para pruebas
const app = express();
app.use(express.json());
app.use('/math', mathRoutes);

describe('GET /math/lcm', () => {
  it('should return the LCM of a list of numbers', async () => {
    const response = await request(app).get('/math/lcm').query({ numbers: '4,5,6' });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('lcm', 60); // LCM of 4, 5, 6 is 60
  });

  it('should return a 400 error for invalid numbers', async () => {
    const response = await request(app).get('/math/lcm').query({ numbers: '4,5,abc' });
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Invalid numbers parameter');
  });

  it('should return a 400 error when numbers are not provided', async () => {
    const response = await request(app).get('/math/lcm');
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'The "numbers" query parameter is required and should be a string.');
  });
});

describe('GET /math/increment', () => {
  it('should return the incremented number', async () => {
    const response = await request(app).get('/math/increment').query({ number: '10' });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('result', 11); // 10 + 1 = 11
  });

  it('should return a 400 error for an invalid number', async () => {
    const response = await request(app).get('/math/increment').query({ number: 'abc' });
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Invalid number parameter');
  });

  it('should return a 400 error when number is not provided', async () => {
    const response = await request(app).get('/math/increment');
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Invalid number parameter');
  });
});
