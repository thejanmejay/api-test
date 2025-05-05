if (process.env.NODE_ENV !== 'test') {
  require('dotenv').config();  // Load environment variables for non-test environments
}

const express = require('express');
const fs = require('fs').promises;
const cors = require('cors');
const Joi = require('joi');
const app = express();
const PORT = process.env.PORT || 5000;
const API_KEY = process.env.API_KEY;
app.use(express.json()); // for parsing application/json


app.use(cors({
  origin: 'http://127.0.0.1:5500', // Ensure this matches your frontend URL
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'x-api-key']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); // Serve static files from 'public' directory

// JSON syntax error handler
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ message: 'Invalid JSON' });
  }
  next();
});

// Joi Schemas for validation
const customerSchema = Joi.object({
  customerId: Joi.number().required(),
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  address: Joi.object({
    city: Joi.string().required(),
    postalCode: Joi.string().required(),
    country: Joi.string().required(),
  }).required(),
  phone: Joi.string().required(),
  isActive: Joi.boolean().required(),
  gender: Joi.string().valid('Male', 'Female', 'Other').required(),
  dob: Joi.string().required()  // Better: use Joi.date().iso() if format is guaranteed
});

// Middleware for API Key Authentication
const apiKeyAuth = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey === API_KEY) {
    next();
  } else {
    res.status(401).json({ message: 'Unauthorized: Invalid API Key' });
  }
};

const dataPath = './data/customers.json';

// Load customer data from file
const loadCustomerData = async () => {
  try {
    const data = await fs.readFile(dataPath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error loading customer data', err);
    return { customers: [] };
  }
};

// Save customer data to file
const saveCustomerData = async (data, res) => {
  try {
    await fs.writeFile(dataPath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error saving customer data', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Routes
app.get('/customers', async (req, res) => {
  const customerData = await loadCustomerData();
  res.json(customerData.customers);
});

app.get('/customers/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: 'Invalid customer ID' });

  const customerData = await loadCustomerData();
  const customer = customerData.customers.find(c => c.customerId === id);

  if (customer) {
    res.json(customer); // Send the customer data if found
  } else {
    res.status(404).json({ message: 'Customer not found' }); // Send 404 if not found
  }
});


app.post('/customers', apiKeyAuth, async (req, res) => {
  const newCustomer = req.body;
  const { error } = customerSchema.validate(newCustomer);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const customerData = await loadCustomerData();
  const exists = customerData.customers.some(c => c.customerId === newCustomer.customerId);
  if (exists) return res.status(400).json({ message: 'Customer ID already exists' });

  customerData.customers.push(newCustomer);
  await saveCustomerData(customerData, res);
  res.status(201).json({ message: 'Customer created successfully', customer: newCustomer });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

// Error Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

// Export for testing or server entry
module.exports = app;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
  });
}
// Test cases are in __tests__/customers.test.js
// To run tests, use: npm test or jest --watchAll --detectOpenHandles --forceExit
