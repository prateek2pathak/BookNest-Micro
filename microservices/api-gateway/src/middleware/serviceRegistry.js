const axios = require('axios');

class ServiceRegistry {
  constructor() {
    this.services = new Map();
    this.healthCheckInterval = 30000; // 30 seconds
    this.startHealthChecks();
  }

  registerService(name, url) {
    this.services.set(name, {
      url,
      healthy: true,
      lastCheck: null,
      retryCount: 0
    });
  }

  getService(name) {
    return this.services.get(name);
  }

  isServiceHealthy(name) {
    const service = this.services.get(name);
    return service && service.healthy;
  }

  async checkServiceHealth(name, url) {
    try {
      const response = await axios.get(`${url}/health`, { 
        timeout: 5000,
        validateStatus: (status) => status === 200
      });
      
      this.services.set(name, {
        ...this.services.get(name),
        healthy: true,
        lastCheck: new Date(),
        retryCount: 0
      });
      
      return true;
    } catch (error) {
      const service = this.services.get(name);
      const retryCount = service ? service.retryCount + 1 : 1;
      
      this.services.set(name, {
        ...this.services.get(name),
        healthy: false,
        lastCheck: new Date(),
        retryCount
      });
      
      console.error(`Health check failed for ${name} (${retryCount} attempts):`, error.message);
      return false;
    }
  }

  async startHealthChecks() {
    setInterval(async () => {
      for (const [name, service] of this.services) {
        await this.checkServiceHealth(name, service.url);
      }
    }, this.healthCheckInterval);
  }

  getServicesStatus() {
    const status = {};
    for (const [name, service] of this.services) {
      status[name] = {
        healthy: service.healthy,
        lastCheck: service.lastCheck,
        retryCount: service.retryCount,
        url: service.url
      };
    }
    return status;
  }
}

module.exports = ServiceRegistry;
