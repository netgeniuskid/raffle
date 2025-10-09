// Simple Express server for Vercel
const express = require('express');
const cors = require('cors');

const app = express();

// CORS middleware
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'x-admin-key']
}));

app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString() 
  });
});

// Admin games endpoint
app.get('/api/admin/games', (req, res) => {
  res.json([]);
});

app.post('/api/admin/games', (req, res) => {
  res.json({ 
    id: '1', 
    name: req.body.name || 'Test Game',
    status: 'DRAFT'
  });
});

// Catch all handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

module.exports = app;
