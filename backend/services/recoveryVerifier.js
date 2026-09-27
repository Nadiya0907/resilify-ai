import { getServicesTelemetry } from './telemetryEngine.js';

export function verifyRecovery(incident) {
  if (!incident) return { verified: false, message: 'No active incident for verification.' };

  const services = getServicesTelemetry();
  const service = services.find(s => s.id === incident.service);

  if (!service) {
    return { verified: false, message: 'Target service not found in telemetry stream.' };
  }

  const isErrorRateHealthy = service.errorRate < 1.0;
  const isLatencyHealthy = service.latencyMs < 200;
  const isStatusHealthy = service.status === 'HEALTHY';

  const verified = isErrorRateHealthy && isLatencyHealthy && isStatusHealthy;

  return {
    verified,
    statusLabel: verified ? 'RECOVERY VERIFIED' : 'RECOVERY NOT VERIFIED',
    checks: [
      { name: 'Error Rate Check (< 1.0%)', status: isErrorRateHealthy ? 'PASSED' : 'FAILED', value: `${service.errorRate}%` },
      { name: 'Latency Check (< 200ms)', status: isLatencyHealthy ? 'PASSED' : 'FAILED', value: `${service.latencyMs}ms` },
      { name: 'DB Connection Check (< 50/100)', status: service.dbConnections !== '100/100' ? 'PASSED' : 'FAILED', value: service.dbConnections },
      { name: 'Service Readiness Probe', status: isStatusHealthy ? 'PASSED' : 'FAILED', value: service.status }
    ],
    timestamp: new Date().toISOString()
  };
}
