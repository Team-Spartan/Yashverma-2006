const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const errorHandler = require('./middleware/errorMiddleware');

// Route imports
const authRoutes = require('./routes/authRoutes');
const waterLogRoutes = require('./routes/waterLogRoutes');
const issueRoutes = require('./routes/issueRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();

// Body parser & Security Middleware
app.use(express.json());
app.use(cors());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', message: 'JalDrishti Water Quality API Service is running smoothly.' });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/logs', waterLogRoutes);
app.use('/api/v1/issues', issueRoutes);
app.use('/api/v1/analytics', analyticsRoutes);

// Global Error Handler
app.use(errorHandler);

module.exports = app;
