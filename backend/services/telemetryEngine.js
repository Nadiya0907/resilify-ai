export const initialServices = [
  {
    id: 'payment-gateway',
    name: 'Payment Gateway',
    status: 'HEALTHY',
    cpuUsage: 22.4,
    memoryUsage: 41.8,
    errorRate: 0.01,
    latencyMs: 45,
    dbConnections: '18/100',
    requestCount: 1250,
    deploymentVersion: 'payment-v2.8.1',
    timestamp: new Date().toISOString()
  },
  {
    id: 'auth-service',
    name: 'Auth & JWT Service',
    status: 'HEALTHY',
    cpuUsage: 18.2,
    memoryUsage: 35.6,
    errorRate: 0.00,
    latencyMs: 12,
    dbConnections: '10/50',
    requestCount: 2400,
    deploymentVersion: 'auth-v1.4.0',
    timestamp: new Date().toISOString()
  },
  {
    id: 'redis-cluster',
    name: 'Redis Cache Cluster',
    status: 'HEALTHY',
    cpuUsage: 14.0,
    memoryUsage: 28.5,
    errorRate: 0.00,
    latencyMs: 2,
    dbConnections: 'N/A',
    requestCount: 8900,
    deploymentVersion: 'redis-v7.2.4',
    timestamp: new Date().toISOString()
  },
  {
    id: 'database',
    name: 'PostgreSQL Primary DB',
    status: 'HEALTHY',
    cpuUsage: 31.0,
    memoryUsage: 58.2,
    errorRate: 0.02,
    latencyMs: 18,
    dbConnections: '28/100',
    requestCount: 3600,
    deploymentVersion: 'postgres-v16.2',
    timestamp: new Date().toISOString()
  }
];

let currentServices = JSON.parse(JSON.stringify(initialServices));

export function getServicesTelemetry() {
  // Add slight organic jitter for realism
  currentServices.forEach(s => {
    if (s.status === 'HEALTHY') {
      s.cpuUsage = parseFloat(Math.max(10, Math.min(45, s.cpuUsage + (Math.random() * 2 - 1))).toFixed(1));
      s.memoryUsage = parseFloat(Math.max(20, Math.min(60, s.memoryUsage + (Math.random() * 1.5 - 0.75))).toFixed(1));
      s.timestamp = new Date().toISOString();
    }
  });
  return currentServices;
}

export function updateServiceTelemetry(serviceId, metrics) {
  const service = currentServices.find(s => s.id === serviceId);
  if (service) {
    Object.assign(service, metrics, { timestamp: new Date().toISOString() });
  }
  return service;
}

export function resetServicesTelemetry() {
  currentServices = JSON.parse(JSON.stringify(initialServices));
  return currentServices;
}
