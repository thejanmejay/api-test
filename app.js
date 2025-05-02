if (process.env.NODE_ENV !== 'test') {
    require('dotenv').config();  // Load environment variables for non-test environments
  }const express = require('express');
const fs = require('fs').promises;
const cors = require('cors');
const Joi = require('joi');


 

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY;

app.use(express.json());
app.use(cors());

// JSON syntax error handler
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ message: 'Invalid JSON' });
  }
  next();
});

// Joi Schemas
const customerSchema = Joi.object({
  customerId: Joi.number().required(),
  name: Joi.string().required(),
  email: Joi.string().email().required(),
}).unknown(true);

const customerPatchSchema = Joi.object({
  name: Joi.string(),
  email: Joi.string().email(),
}).min(1);

// Middleware: API Key Auth
const apiKeyAuth = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey === API_KEY) {
    next();
  } else {
    res.status(401).json({ message: 'Unauthorized: Invalid API Key' });
  }
};

const dataPath = './data/customers.json';

// Load data
const loadCustomerData = async () => {
  try {
    const data = await fs.readFile(dataPath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error loading customer data', err);
    return { customers: [] };
  }
};

// Save data
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
  res.json(customerData);
});

app.get('/customers/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: 'Invalid customer ID' });

  const customerData = await loadCustomerData();
  const customer = customerData.customers.find(c => c.customerId === id);

  if (customer) {
    res.json(customer);
  } else {
    res.status(404).json({ message: 'Customer not found' });
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

app.put('/customers/:id', apiKeyAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: 'Invalid customer ID' });

  const { error } = customerSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const customerData = await loadCustomerData();
  const index = customerData.customers.findIndex(c => c.customerId === id);
  if (index === -1) return res.status(404).json({ message: 'Customer not found' });

  customerData.customers[index] = { ...req.body };
  await saveCustomerData(customerData, res);
  res.json({ message: 'Customer updated successfully', customer: req.body });
});

app.patch('/customers/:id', apiKeyAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: 'Invalid customer ID' });

  if ('customerId' in req.body && req.body.customerId !== id) {
    return res.status(400).json({ message: 'Cannot change customer ID' });
  }

  const { error } = customerPatchSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const customerData = await loadCustomerData();
  const index = customerData.customers.findIndex(c => c.customerId === id);
  if (index === -1) return res.status(404).json({ message: 'Customer not found' });

  customerData.customers[index] = {
    ...customerData.customers[index],
    ...req.body,
  };

  await saveCustomerData(customerData, res);
  res.json({ message: 'Customer details updated successfully', customer: customerData.customers[index] });
});

app.delete('/customers/:id', apiKeyAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: 'Invalid customer ID' });

  const customerData = await loadCustomerData();
  const index = customerData.customers.findIndex(c => c.customerId === id);
  if (index === -1) return res.status(404).json({ message: 'Customer not found' });

  customerData.customers.splice(index, 1);
  await saveCustomerData(customerData, res);
  res.json({ message: 'Customer deleted successfully' });
});

app.get('/customers/email/:email', async (req, res) => {
  const email = req.params.email;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  const customerData = await loadCustomerData();
  const customer = customerData.customers.find(c => c.email === email);

  if (customer) {
    res.json(customer);
  } else {
    res.status(404).json({ message: 'Customer not found' });
  }
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