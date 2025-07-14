const ServiceRegistry = require('./serviceRegistry');
const dotenv = require('dotenv');

dotenv.config();

const serviceRegistry = new ServiceRegistry();

// Register all services
serviceRegistry.registerService('auth', process.env.AUTH_SERVICE_URL || 'http://localhost:5001');
serviceRegistry.registerService('book', process.env.BOOK_SERVICE_URL || 'http://localhost:5002');
serviceRegistry.registerService('comment', process.env.COMMENT_SERVICE_URL || 'http://localhost:5003');
serviceRegistry.registerService('chat', process.env.CHAT_SERVICE_URL || 'http://localhost:5004');

// Middleware to check service health before proxying
const healthCheckMiddleware = (serviceName) => {
  return (req, res, next) => {
    if (!serviceRegistry.isServiceHealthy(serviceName)) {
      return res.status(503).json({
        error: 'Service unavailable',
        message: `The ${serviceName} service is currently unavailable`,
        service: serviceName,
        timestamp: new Date().toISOString()
      });
    }
    next();
  };
};

// Route to get service health status
const getServiceStatus = (req, res) => {
  const status = serviceRegistry.getServicesStatus();
  const allHealthy = Object.values(status).every(service => service.healthy);
  
  res.status(allHealthy ? 200 : 503).json({
    overall: allHealthy ? 'healthy' : 'degraded',
    services: status,
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  serviceRegistry,
  healthCheckMiddleware,
  getServiceStatus
};
