const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const apiRoutes = require('./routes/api');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded audio files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Mount API routes
app.use('/api', apiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'IndicVoice Lab Backend',
    timestamp: new Date().toISOString()
  });
});

// Optional MongoDB Atlas connection
if (process.env.MONGODB_URI) {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log(' Connected to MongoDB Atlas'))
    .catch((err) => console.warn('⚠️ MongoDB connection error, using local storage:', err.message));
} else {
  console.log('ℹ️ MONGODB_URI not provided. Using embedded JSON storage for zero-config startup.');
}

app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 IndicVoice Lab API running on port ${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/health`);
  console.log(`🧪 API Base:    http://localhost:${PORT}/api`);
  console.log(`===============================================`);
});

