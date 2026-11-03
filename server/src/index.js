const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const apiRoutes = require('./routes/api');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares (Pillar 3: Security & Data Privacy)
app.use(helmet({
  crossOriginResourcePolicy: false // Allow audio playback across ports in development
}));

// NoSQL operator injection sanitization
app.use(mongoSanitize());

// CORS configuration
app.use(cors({
  origin: true,
  credentials: true
}));

// Rate limiting on test execution endpoint to protect Gnani API credits
const testRunLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Rate limit exceeded: Please wait before submitting more audio runs.' }
});

app.use('/api/tests/:id/run', testRunLimiter);

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Serve static uploaded audio files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Mount API routes
app.use('/api', apiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'IndicVoice Lab Enterprise Backend',
    timestamp: new Date().toISOString()
  });
});

// Serve static client build if present in production
const clientDistPath = path.join(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path === '/health') return next();
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Optional MongoDB Atlas connection
if (process.env.MONGODB_URI) {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log(' Connected to MongoDB Atlas'))
    .catch((err) => console.warn('⚠️ MongoDB connection error, using local storage fallback:', err.message));
} else {
  console.log('ℹ️ MONGODB_URI not provided. Using embedded JSON storage for zero-config startup.');
}

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 IndicVoice Lab API running on port ${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/health`);
  console.log(`🧪 API Base:    http://localhost:${PORT}/api`);
  console.log(`🔒 Security:    Helmet + NoSQL Sanitizer + Rate Limiter Active`);
  console.log(`=======================================================`);
});
