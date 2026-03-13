// server.js
// =====================================================
// Enterprise Ticket Management System - Backend Server
// Node.js + Express + MySQL + Power Automate Integration
// =====================================================
require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const ticketRoutes = require('./src/routes/tickets');

const app  = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ────────────────────────────────────────
app.use(cors({
  origin: 'http://localhost:4200', // Angular dev server
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Health Check ──────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    service: 'Ticket Management API',
    version: '1.0.0',
    status:  'running',
    time:    new Date().toISOString(),
  });
});

// ─── Routes ────────────────────────────────────────────
app.use('/api/tickets', ticketRoutes);

// ─── 404 Handler ───────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// ─── Global Error Handler ──────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

// ─── Start Server ──────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Ticket Management API is running`);
  console.log(`   Local:   http://localhost:${PORT}`);
  console.log(`   Tickets: http://localhost:${PORT}/api/tickets\n`);
});

module.exports = app;
