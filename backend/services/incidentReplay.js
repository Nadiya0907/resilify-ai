export const replayScenarios = [
  {
    id: 'payment-db-failure',
    title: 'Payment Database Connection Exhaustion',
    service: 'payment-gateway',
    severity: 'CRITICAL',
    symptoms: '504 Gateway Timeout on POST /api/v1/charge, active HikariCP pool at 100% capacity (100/100 connections), error rate spiking to 38.7%.',
    deploymentVersion: 'payment-v2.8.1',
    telemetry: {
      cpuUsage: 94.2,
      memoryUsage: 88.6,
      errorRate: 38.7,
      latencyMs: 4820,
      dbConnections: '100/100',
      requestCount: 4200
    }
  },
  {
    id: 'redis-outage',
    title: 'Redis Cache Outage & Thundering Herd',
    service: 'redis-cluster',
    severity: 'HIGH',
    symptoms: 'Database CPU spiked to 99%, catalog query latency degraded from 2ms to 4800ms following scheduled catalog cache key expiration.',
    deploymentVersion: 'redis-v7.2.4',
    telemetry: {
      cpuUsage: 99.0,
      memoryUsage: 65.4,
      errorRate: 15.0,
      latencyMs: 4800,
      dbConnections: '92/100',
      requestCount: 8900
    }
  },
  {
    id: 'auth-failure',
    title: 'Authentication Service Memory Leak',
    service: 'auth-service',
    severity: 'HIGH',
    symptoms: 'auth-service pod restart loop (exit code 137 OOMKilled), RSS memory growing linearly by 85MB/min under high auth token volume.',
    deploymentVersion: 'auth-v1.4.0',
    telemetry: {
      cpuUsage: 78.5,
      memoryUsage: 98.2,
      errorRate: 24.2,
      latencyMs: 1250,
      dbConnections: '45/50',
      requestCount: 2400
    }
  },
  {
    id: 'api-latency-spike',
    title: 'API Latency Spike & Gateway Cascade',
    service: 'payment-gateway',
    severity: 'MEDIUM',
    symptoms: 'Upstream payment provider TLS cipher renegotiation caused 3500ms P99 latency spikes and queue backpressure.',
    deploymentVersion: 'payment-v2.8.1',
    telemetry: {
      cpuUsage: 62.1,
      memoryUsage: 54.0,
      errorRate: 12.4,
      latencyMs: 3500,
      dbConnections: '65/100',
      requestCount: 3100
    }
  },
  {
    id: 'deployment-regression',
    title: 'Deployment v2.8.1 Configuration Regression',
    service: 'payment-gateway',
    severity: 'CRITICAL',
    symptoms: 'Post-deployment regression: HTTP 500 error rate spiked to 45% immediately following deployment of image tag payment-v2.8.1.',
    deploymentVersion: 'payment-v2.8.1',
    telemetry: {
      cpuUsage: 89.0,
      memoryUsage: 82.1,
      errorRate: 45.0,
      latencyMs: 2900,
      dbConnections: '88/100',
      requestCount: 3800
    }
  }
];

export function getReplayScenarios() {
  return replayScenarios;
}

export function getReplayScenarioById(id) {
  return replayScenarios.find(s => s.id === id) || replayScenarios[0];
}
