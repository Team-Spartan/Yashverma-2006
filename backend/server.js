const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const waterTestRoutes = require('./routes/waterTests');
const issueRoutes = require('./routes/issues');
const adminRoutes = require('./routes/admin');

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/water-tests', waterTestRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`AquaWatch server running on port ${PORT}`);
});
