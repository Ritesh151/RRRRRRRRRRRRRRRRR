const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// CORS - Allow all origins for development (Flutter Web + Mobile)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json());

// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/hospitalDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ MongoDB Connected');
}).catch(err => {
  console.error('❌ MongoDB Connection Error:', err);
});

// ================= MODELS =================
const Hospital = mongoose.model('Hospital', {
  name: String,
  city: String,
  type: String,
});

const User = mongoose.model('User', {
  name: String,
  role: String,
  active: Boolean,
});

const Ticket = mongoose.model('Ticket', {
  title: String,
});

// ================= DASHBOARD API =================
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const [totalHospitals, totalUsers, activeAdmins, totalTickets] = await Promise.all([
      Hospital.countDocuments(),
      User.countDocuments(),
      User.countDocuments({ role: 'ADMIN', active: true }),
      Ticket.countDocuments(),
    ]);

    console.log('📊 Dashboard Stats:', { totalHospitals, totalUsers, activeAdmins, totalTickets });

    res.json({
      totalHospitals,
      totalUsers,
      activeAdmins,
      totalTickets,
      statsByType: { gov: 0, private: 0, semi: 0 },
    });
  } catch (e) {
    console.error('❌ Dashboard Error:', e);
    res.status(500).json({ error: e.message });
  }
});

// ================= HOSPITAL APIs =================
app.get('/api/hospitals', async (req, res) => {
  try {
    const hospitals = await Hospital.find();
    res.json(hospitals);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/hospitals', async (req, res) => {
  try {
    const hospital = new Hospital(req.body);
    await hospital.save();
    res.json(hospital);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/hospitals/:id', async (req, res) => {
  try {
    await Hospital.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ================= USER APIs =================
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ================= TICKET APIs =================
app.get('/api/tickets', async (req, res) => {
  try {
    const tickets = await Ticket.find();
    res.json(tickets);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/tickets', async (req, res) => {
  try {
    const ticket = new Ticket(req.body);
    await ticket.save();
    res.json(ticket);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ================= HEALTH CHECK =================
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

app.get('/', (req, res) => {
  res.json({ message: 'Hospital API Running', version: '1.0' });
});

// ================= START SERVER =================
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/api/dashboard/stats`);
});
