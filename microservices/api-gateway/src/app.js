const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const { healthCheckMiddleware, getServiceStatus } = require('./middleware/healthCheck');

dotenv.config();

const app = express();

// Security middleware
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));

// Logging
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

app.use(limiter);


// Service URLs
const services = {
  auth: process.env.AUTH_SERVICE_URL || 'http://localhost:5001',
  book: process.env.BOOK_SERVICE_URL || 'http://localhost:5002',
  comment: process.env.COMMENT_SERVICE_URL || 'http://localhost:5003',
  chat: process.env.CHAT_SERVICE_URL || 'http://localhost:5004'
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'API Gateway is running', 
    timestamp: new Date().toISOString(),
    services: services
  });
});

// Service status endpoint
app.get('/api/status', getServiceStatus);

// API Gateway routes
app.get('/api', (req, res) => {
  res.json({
    message: 'BookNest API Gateway',
    version: '1.0.0',
    availableServices: [
      '/api/auth/* - Authentication Service',
      '/api/books/* - Book Management Service',
      '/api/comments/* - Comment Service',
      '/api/chat/* - Chat Service'
    ]
  });
});

// Proxy configuration options
const proxyOptions = {
  changeOrigin: true, //Modifies the Host header of the request to match the target (needed for many APIs)
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(500).json({
      error: 'Service temporarily unavailable',
      message: 'The requested service is currently unavailable. Please try again later.',
      timestamp: new Date().toISOString()
    });
  },
  onProxyReq: (proxyReq, req, res) => {
    // Log proxy requests
    console.log(`Proxying ${req.method} ${req.url} to ${proxyReq.path}`);
  }
};

// Auth service proxy
app.use('/api/auth', healthCheckMiddleware('auth'), createProxyMiddleware({
  target: services.auth,
  ...proxyOptions,
  pathRewrite: {
    '^/api/auth': '/api/auth'
  }
}));

// Book service proxy
app.use('/api/books', healthCheckMiddleware('book'), createProxyMiddleware({
  target: services.book,
  ...proxyOptions,
  pathRewrite: {
    '^/api/books': '/api/books'
  }
}));

// Comment service proxy
app.use('/api/comments', healthCheckMiddleware('comment'), createProxyMiddleware({
  target: services.comment,
  ...proxyOptions,
  pathRewrite: {
    '^/api/comments': '/api/comments'
  }
}));

// Chat service proxy (HTTP endpoints)
app.use('/api/chat', healthCheckMiddleware('chat'), createProxyMiddleware({
  target: services.chat,
  ...proxyOptions,
  pathRewrite: {
    '^/api/chat': '/api/messages'
  }
}));

// Socket.IO proxy for chat service
app.use('/socket.io', createProxyMiddleware({
  target: services.chat,
  changeOrigin: true,
  ws: true, // Enable websocket proxying
  timeout: 60000,
  proxyTimeout: 60000,
  onError: (err, req, res) => {
    console.error('Socket.IO Proxy error:', err);
    res.status(500).json({
      error: 'Chat service unavailable',
      message: 'Unable to connect to chat service',
      timestamp: new Date().toISOString()
    });
  }
}));

// Catch-all for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: 'The requested endpoint does not exist',
    availableRoutes: [
      '/api/auth/*',
      '/api/books/*',
      '/api/comments/*',
      '/api/chat/*'
    ],
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Gateway error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: 'An unexpected error occurred',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
  console.log('Service endpoints:');
  Object.entries(services).forEach(([name, url]) => {
    console.log(`  ${name}: ${url}`);
  });
});

module.exports = app;
