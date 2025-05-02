// __tests__/customers.test.js
process.env.NODE_ENV = 'test';  // Ensure test environment is set
require('dotenv').config();     // Load .env variables

const request = require('supertest');
const app = require('../app'); // Import your app

describe('API health check', () => {
  it('GET /customers should return status 200', async () => {
    const res = await request(app).get('/customers');
    expect(res.statusCode).toBe(200);
  });

  it('GET /customers/:id should return status 200 for a valid customer ID', async () => {
    const res = await request(app).get('/customers/101');
    expect(res.statusCode).toBe(200);
    expect(res.body.customerId).toBe(101);
  });

  it('POST /customers should create a new customer', async () => {
    const newCustomer = {
      customerId: 107,
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+91-1234567890',
      isActive: true,
      gender: 'male',
      dob: '1990-01-01',
      address: {
        street: '10 Test Street',
        city: 'Test City',
        state: 'Test State',
        postalCode: '123456',
        country: 'Test Country',
      },
      createdAt: new Date().toISOString(),
    };

    const res = await request(app)
      .post('/customers')
      .set('x-api-key', process.env.API_KEY)
      .send(newCustomer);

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('Customer created successfully');
  });
});
