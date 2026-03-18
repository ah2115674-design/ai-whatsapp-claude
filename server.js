require('dotenv').config();

const express = require('express');
const cors = require('cors');

// ── Route modules ─────────────────────────────────────────────────────────────
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const leadRoutes = require('./routes/leads');
const settingsRoutes = require('./routes/settings');
const whatsappRoutes = require('./routes/whatsapp');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// JSON body parser for all routes EXCEPT the Twilio webhook
// (Twilio sends application/x-www-form-urlencoded — handled inside the route)
app.use((req, res, next) => {
  if (req.path === '/api/webhook') return next();
  express.json()(req, res, next);
});

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api', authRoutes);                   // /api/signup  /api/login  /api/user
app.use('/api/products', productRoutes);       // /api/products (CRUD)
app.use('/api/leads', leadRoutes);             // /api/leads (CRUD + dashboard + export)
app.use('/api/settings', settingsRoutes);      // /api/settings
app.use('/save-whatsapp', settingsRoutes);     // legacy path from frontend spec

// WhatsApp routes
app.use('/api/whatsapp', whatsappRoutes);      // /api/whatsapp/test
app.use('/api', whatsappRoutes);               // /api/webhook (Twilio hits this)

// ── 404 catch-all ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[unhandled error]', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅  Zync AI CRM backend running on port ${PORT}`);
  console.log(`   Webhook URL: ${process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`}/api/webhook`);
});
