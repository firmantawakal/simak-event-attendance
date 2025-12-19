require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const http = require('http');
const socketIo = require('socket.io');

const eventRoutes = require('./routes/events');
const attendanceRoutes = require('./routes/attendance');
const authRoutes = require('./routes/auth');
const institutionsRoutes = require('./routes/institutions');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Create HTTP server and Socket.io instance
const server = http.createServer(app);

// Define allowed origins for both CORS and Socket.io
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://event.unidumdev.my.id',
  'http://event.unidumdev.my.id',           // Frontend subdomain
  'https://event.unidumdev.my.id',          // Frontend subdomain (HTTPS)
  'http://localhost:3000',                  // Development fallback
  'http://localhost:5001',                  // Local fallback
  'http://192.168.18.33:5001'              // Network access (for local development)
];

const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Store io instance for use in controllers
app.set('io', io);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);

  socket.on('join-event', (eventId) => {
    socket.join(`event-${eventId}`);
    console.log(`👥 Socket ${socket.id} joined event ${eventId}`);
  });

  socket.on('leave-event', (eventId) => {
    socket.leave(`event-${eventId}`);
    console.log(`👋 Socket ${socket.id} left event ${eventId}`);
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

// Security middleware - relaxed for mobile compatibility
// In production, use minimal security headers for mobile compatibility
if (process.env.NODE_ENV === 'production') {
  // More permissive CSP for mobile and network access
  app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP entirely for mobile compatibility
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
  }));
} else {
  // Normal CSP for development
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
      },
    },
  }));
}

// Rate limiting (less restrictive for development)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Stricter rate limiting for attendance endpoint
const attendanceLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 attendance submissions per windowMs
  message: 'Too many attendance submissions, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// CORS configuration
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// General middleware
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/institutions', institutionsRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Serve static files from React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../client/build')));

  // Handle React Router - return index.html for any non-API routes
  app.get('*', (req, res) => {
    // Don't handle API routes
    if (req.originalUrl.startsWith('/api')) {
      return res.status(404).json({
        error: 'Route not found',
        message: `Cannot ${req.method} ${req.originalUrl}`
      });
    }

    // Don't handle health route
    if (req.originalUrl === '/health') {
      return res.status(404).json({
        error: 'Route not found',
        message: `Cannot ${req.method} ${req.originalUrl}`
      });
    }

    res.sendFile(path.join(__dirname, '../../client/build/index.html'));
  });
}

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
if (require.main === module) {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📚 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL}`);
    console.log(`🌐 Accessible at: http://0.0.0.0:${PORT}`);
    console.log(`🔌 Socket.io enabled`);
  });
}

module.exports = app;