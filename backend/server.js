const express = require('express');
// Force Restart 3 // restart trigger 3
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const hpp = require('hpp');
const Sentry = require('@sentry/node');
const { apiLimiter } = require('./middleware/rateLimiter');
const { validateEnv } = require('./config/env');
const logger = require('./services/logger');
const { gatekeeper, CAPABILITIES } = require('./middleware/gatekeeper');

// Load Validated Config
const config = validateEnv();
const API_PREFIX = config.apiPrefix;

const app = express();
app.set('trust proxy', 1);

// Initialise Sentry if DSN provided
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    environment: process.env.NODE_ENV || 'development',
  });
  app.use(Sentry.Handlers.requestHandler());
}

// Database Connection initialized with Supabase client
const { supabase } = require('./utils/supabase/server');
logger.info('Supabase backend client active');


// ---------- Middleware ----------
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean);
const corsOptions = {
  origin: allowedOrigins.length ? allowedOrigins : true,
  credentials: true,
};

app.use(cors(corsOptions));
// Increased limit for Serverless uploads (Vercel max 4.5MB)
app.use(express.json({ limit: '4mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(hpp());
app.use(compression());
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(
  helmet.hsts({
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  })
);

const morganStream = {
  write: (message) => logger.info(message.trim()),
};
app.use(morgan('combined', { stream: morganStream }));

// ---------- Routes ----------
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes');
const contactRoutes = require('./routes/contactRoutes');
const newsletterRoutes = require('./routes/newsletterRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const phase1Routes = require('./routes/phase1Routes');
const phase2Routes = require('./routes/phase2Routes');
const phase3Routes = require('./routes/phase3Routes');
const healthRoutes = require('./routes/healthRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/webhook', require('./routes/webhookRoutes'));
app.use('/api/admin', gatekeeper(CAPABILITIES.STATE_MUTATING), require('./routes/adminRoutes'));
// Add Health Route Explicitly if not covered
app.use('/api/health', healthRoutes);

// Global error handler
app.use((err, req, res, _next) => {
  logger.error('Unhandled error', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });
  res.status(err.status || 500).json({
    error: `Error: ${err.message}`,
    stack: err.stack // Temporarily exposing stack for debugging
  });
});

// Only start server if running directly
if (require.main === module) {
  const bootstrap = require('./bootstrap');
  bootstrap().then(({ config }) => {
    const PORT = config.port;
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Mode: ${config.env}`);
    }).on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        logger.error(`Port ${PORT} is already in use!`);
        process.exit(1);
      } else {
        logger.error('Server error', { error: err.message });
      }
    });
  });
}

module.exports = app;

// GLOBAL CRASH HANDLING (Exit Strategy)
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', { promise, reason: reason?.message || reason });
  // Flush logs if possible, then exit to allow restart
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', { error: error.message, stack: error.stack });
  // Flush logs if possible, then exit
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});
