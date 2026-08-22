const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/omnora', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Schemas
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String },
  description: { type: String },
  featured: { type: Boolean, default: false },
  newArrival: { type: Boolean, default: false },
});
const Product = mongoose.model('Product', productSchema);

const eventSchema = new mongoose.Schema({
  type: { type: String, required: true },
  sessionId: { type: String },
  path: { type: String },
  payload: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
});
const Event = mongoose.model('Event', eventSchema);

const orderSchema = new mongoose.Schema({
  customer: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
  },
  shipping: {
    address: String,
    country: String,
  },
  items: [{
    id: String,
    name: String,
    price: Number,
    quantity: Number,
  }],
  total: { type: Number, required: true },
  orderNumber: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});
const Order = mongoose.model('Order', orderSchema);

// Routes
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find().limit(20);
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/products/featured', async (req, res) => {
  try {
    const products = await Product.find({ featured: true }).limit(10);
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/products/new-arrivals', async (req, res) => {
  try {
    const products = await Product.find({ newArrival: true }).sort({ createdAt: -1 }).limit(10);
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/track', async (req, res) => {
  try {
    const event = new Event(req.body);
    await event.save();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/events', async (req, res) => {
  try {
    const { type, sessionId, limit = 200 } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (sessionId) filter.sessionId = sessionId;
    const events = await Event.find(filter).sort({ createdAt: -1 }).limit(Number(limit));
    res.json({ events });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { customer, shipping, items, total } = req.body;
    const orderNumber = `ORD-${Date.now()}`;
    const order = new Order({
      customer,
      shipping,
      items,
      total,
      orderNumber,
    });
    await order.save();
    const whatsappLink = `https://wa.me/923334355475?text=Order ${orderNumber} - Total: PKR ${total}. Details: ${JSON.stringify({ customer, items })}`;
    res.json({ success: true, orderNumber, whatsappLink });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Seed initial data (run once or on startup if empty)
async function seedData() {
  const count = await Product.countDocuments();
  if (count === 0) {
    await Product.insertMany([
      {
        name: 'Noor-e-Zari Velvet Formal Suit',
        price: 18500,
        image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=800&q=80',
        description: 'Hand-embroidered zardozi velvet suit with organza dupatta',
        featured: true,
      },
      {
        name: 'Mah-ru Raw Silk Co-ord Set',
        price: 14200,
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
        description: 'Tailored 80g raw silk tunic with pearl embellishments',
        newArrival: true,
      },
    ]);
    console.log('Seeded sample products');
  }
}
seedData();

app.listen(3001, () => console.log('Server running on http://localhost:3001'));