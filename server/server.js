import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import crypto from 'crypto';
import { decrypt } from './utils/cryptoUtils.js';

dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  if (req.method === 'POST') console.log('Body:', JSON.stringify(req.body).substring(0, 100));
  next();
});

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI is not defined in .env.local");
  process.exit(1);
}

// --- Models ---

// Order Model
const orderSchema = new mongoose.Schema({
  orderId: String,
  customerName: String,
  email: String,
  contact: String,
  address: String,
  payment: String,
  total: Number,
  status: { type: String, default: 'Pending' },
  items: Array,
  uroPayOrderId: String,
  referenceNumber: String,
  date: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);

// Product Model
const productSchema = new mongoose.Schema({
  id: String,
  category: String,
  brand: String,
  name: String,
  price: Number,
  stock: { type: Number, default: 10 },
  category_type: { type: String, enum: ['COMPONENT', 'PREBUILT', 'ACCESSORY'] },
  image: String,
  specs: mongoose.Schema.Types.Mixed,
  badge: String,
  socket: String,
  wattage: Number
}, { strict: false });

const Product = mongoose.model('Product', productSchema);

// Review Model
const reviewSchema = new mongoose.Schema({
  id: Number,
  name: String,
  avatar: String,
  rating: Number,
  date: String,
  title: String,
  content: String,
  purchase: String
});

const Review = mongoose.model('Review', reviewSchema);

// User Profile Model
const userSchema = new mongoose.Schema({
  uid: { type: String, unique: true },
  id: { type: String, unique: true },
  name: String,
  email: String,
  password: String,
  username: String,
  address: String,
  phone: String,
  orderHistory: { type: Array, default: [] },
  cart: { type: Array, default: [] }
});

const User = mongoose.model('User', userSchema);

const connectWithRetry = () => {
  console.log('⏳ Attempting to connect to MongoDB...');
  mongoose.connect(MONGODB_URI)
    .then(() => {
      console.log('✅ Connected to MongoDB Atlas');
    })
    .catch((err) => {
      console.error('❌ MongoDB connection error:', err);
      console.log('🔄 Retrying in 5 seconds...');
      setTimeout(connectWithRetry, 5000);
    });
};

connectWithRetry();

// --- Routes ---

app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected' });
});

// --- Product Routes ---
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const product = new Product(req.body);
    const saved = await product.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const updated = await Product.findOneAndUpdate({ id: req.params.id }, req.body, { returnDocument: 'after' });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    await Product.findOneAndDelete({ id: req.params.id });
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- Review Routes ---
app.get('/api/reviews', async (req, res) => {
  try {
    const reviews = await Review.find();
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/reviews', async (req, res) => {
  try {
    const review = new Review(req.body);
    const saved = await review.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// --- User Profile Routes ---
app.get('/api/users/:uid', async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.params.uid });
    res.json(user || {});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/users/:uid', async (req, res) => {
  try {
    const updated = await User.findOneAndUpdate(
      { uid: req.params.uid },
      req.body,
      { returnDocument: 'after', upsert: true }
    );
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


// --- Order Routes ---
app.post('/api/orders', async (req, res) => {
  try {
    const newOrder = new Order(req.body);
    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/orders/:orderId', async (req, res) => {
  try {
    const updated = await Order.findOneAndUpdate(
      { orderId: req.params.orderId },
      req.body,
      { returnDocument: 'after' }
    );
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get('/api/orders/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    let order = null;
    
    // Attempt search by custom orderId string first (e.g., VPC-1234-A)
    order = await Order.findOne({ orderId: orderId });
    
    // If not found and looks like a MongoDB ObjectId, try findById
    if (!order && mongoose.Types.ObjectId.isValid(orderId)) {
      order = await Order.findById(orderId);
    }

    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- UroPay Payment Routes ---

const UROPAY_API_URL = 'https://api.uropay.me';

// Function to generate hashed secret
const getHashedSecret = () => {
  const masterKey = process.env.MASTER_KEY;
  const encryptedSecret = process.env.UROPAY_SECRET;
  const secret = decrypt(encryptedSecret, masterKey);
  
  if (!secret) return "";
  return crypto.createHash('sha512').update(secret).digest('hex');
};

app.post('/api/payments/create-order', async (req, res) => {
  try {
    const { amount, customerName, customerEmail, merchantOrderId, transactionNote } = req.body;
    
    const masterKey = process.env.MASTER_KEY;
    const apiKey = decrypt(process.env.UROPAY_API_KEY, masterKey);
    const hashedSecret = getHashedSecret();
    const vpa = decrypt(process.env.UROPAY_VPA, masterKey);

    if (!apiKey || !hashedSecret || !vpa) {
      return res.status(500).json({ message: "UroPay credentials missing in environment" });
    }

    const response = await fetch(`${UROPAY_API_URL}/order/generate`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-API-KEY': apiKey,
        'Authorization': `Bearer ${hashedSecret}`
      },
      body: JSON.stringify({
        vpa: vpa,
        vpaName: "VoltPC Engineering",
        amount: amount || 0, // Using 0 for testing as requested
        merchantOrderId: merchantOrderId || `VPC-${Date.now()}`,
        transactionNote: transactionNote || "VoltPC Checkout",
        customerName: (customerName || "Guest").replace(/[“”]/g, '"').replace(/[‘’]/g, "'"),
        customerEmail: customerEmail || "guest@example.com"
      })
    });

    const data = await response.json();
    if (data.status === 'success') {
      res.json(data.data);
    } else {
      res.status(400).json(data);
    }
  } catch (error) {
    console.error('UroPay Create Order Error:', error);
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/payments/status/:uroPayOrderId', async (req, res) => {
  try {
    const { uroPayOrderId } = req.params;
    
    const masterKey = process.env.MASTER_KEY;
    const apiKey = decrypt(process.env.UROPAY_API_KEY, masterKey);
    const hashedSecret = getHashedSecret();

    if (!apiKey || !hashedSecret) {
      return res.status(500).json({ message: "UroPay credentials missing" });
    }

    const response = await fetch(`${UROPAY_API_URL}/order/status/${uroPayOrderId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-API-KEY': apiKey,
        'Authorization': `Bearer ${hashedSecret}`
      }
    });

    const text = await response.text();
    if (!text) {
      console.warn(`UroPay returned empty response for order ${uroPayOrderId}`);
      return res.json({ status: 'pending', message: 'No status data available yet' });
    }

    try {
      const data = JSON.parse(text);
      res.json(data);
    } catch (e) {
      console.error('Failed to parse UroPay status JSON:', text);
      res.status(500).json({ message: "Invalid response from payment gateway" });
    }
  } catch (error) {
    console.error('UroPay Status Check Error:', error);
    res.status(500).json({ message: error.message });
  }
});

app.patch('/api/payments/verify', async (req, res) => {
  try {
    const { uroPayOrderId, referenceNumber } = req.body;
    
    const masterKey = process.env.MASTER_KEY;
    const apiKey = decrypt(process.env.UROPAY_API_KEY, masterKey);
    const hashedSecret = getHashedSecret();

    if (!apiKey || !hashedSecret) {
      return res.status(500).json({ message: "UroPay credentials missing in environment" });
    }

    const response = await fetch(`${UROPAY_API_URL}/order/update`, {
      method: 'PATCH',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-API-KEY': apiKey,
        'Authorization': `Bearer ${hashedSecret}`
      },
      body: JSON.stringify({
        uroPayOrderId,
        referenceNumber
      })
    });

    const data = await response.json();
    if (data.status === 'success') {
      res.json(data);
    } else {
      res.status(400).json(data);
    }
  } catch (error) {
    console.error('UroPay Verification Error:', error);
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const { email } = req.query;
    const query = email ? { email } : {};
    const orders = await Order.find(query);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});

// Global Error Handler for JSON parse errors
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('JSON Parse Error:', err.message);
    return res.status(400).json({ message: 'Invalid JSON payload' });
  }
  console.error('Unhandled Error:', err);
  res.status(500).json({ message: 'Internal Server Error' });
});
