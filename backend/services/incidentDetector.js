import { updateServiceTelemetry, getServicesTelemetry } from './telemetryEngine.js';

let activeIncident = null;
let incidentHistory = [];

export function getActiveIncident() {
  return activeIncident;
}

export function getIncidentHistory() {
  return incidentHistory;
}

export function createIncidentFromTelemetry(serviceId, anomalyConfig) {
  const services = getServicesTelemetry();
  const service = services.find(s => s.id === serviceId) || services[0];

  // Update telemetry to reflect active outage
  updateServiceTelemetry(service.id, {
    status: anomalyConfig.severity || 'CRITICAL',
    cpuUsage: anomalyConfig.telemetry?.cpuUsage || 94.2,
    memoryUsage: anomalyConfig.telemetry?.memoryUsage || 88.6,
    errorRate: anomalyConfig.telemetry?.errorRate || 38.7,
    latencyMs: anomalyConfig.telemetry?.latencyMs || 4820,
    dbConnections: anomalyConfig.telemetry?.dbConnections || '100/100',
    requestCount: anomalyConfig.telemetry?.requestCount || 4200,
    deploymentVersion: anomalyConfig.deploymentVersion || service.deploymentVersion
  });

  const updatedService = getServicesTelemetry().find(s => s.id === service.id);

  const incidentId = `INC-${new Date().getFullYear()}-${Math.floor(10 + Math.random() * 90)}`;

  activeIncident = {
    id: incidentId,
    service: updatedService.id,
    serviceName: updatedService.name,
    severity: anomalyConfig.severity || 'CRITICAL',
    status: 'INVESTIGATING',
    title: anomalyConfig.title || `${updatedService.name} Performance Degradation`,
    symptoms: anomalyConfig.symptoms || `Error rate spiked to ${updatedService.errorRate}%, latency ${updatedService.latencyMs}ms, DB connections ${updatedService.dbConnections}.`,
    deploymentVersion: updatedService.deploymentVersion,
    timestamp: new Date().toISOString(),
    telemetrySnapshot: { ...updatedService },
    timeline: [
      { timestamp: new Date(Date.now() - 120000).toLocaleTimeString(), event: `Deployment ${updatedService.deploymentVersion} published` },
      { timestamp: new Date(Date.now() - 60000).toLocaleTimeString(), event: `Database connections exceeded 90% capacity (${updatedService.dbConnections})` },
      { timestamp: new Date(Date.now() - 30000).toLocaleTimeString(), event: `API latency increased to ${updatedService.latencyMs}ms` },
      { timestamp: new Date(Date.now() - 15000).toLocaleTimeString(), event: `HTTP 5xx error rate spiked to ${updatedService.errorRate}%` },
      { timestamp: new Date().toLocaleTimeString(), event: `Resilify Incident Detector triggered ${incidentId}` }
    ]
  };

  console.log(`[Incident Detector] Created incident ${activeIncident.id} (${activeIncident.status}) for ${activeIncident.service}`);
  return activeIncident;
}

export function updateIncidentStatus(status, timelineEntry = null) {
  if (activeIncident) {
    activeIncident.status = status;
    if (timelineEntry) {
      activeIncident.timeline.push({
        timestamp: new Date().toLocaleTimeString(),
        event: timelineEntry
      });
    }
  }
  return activeIncident;
}

export function archiveActiveIncident(resolvedData) {
  if (!activeIncident) return null;

  const resolvedIncident = {
    ...activeIncident,
    status: 'RESOLVED',
    resolvedAt: new Date().toISOString(),
    actualMTTR: resolvedData.actualMTTR || 3,
    runbookApplied: resolvedData.runbookId,
    postMortem: resolvedData.postMortem
  };

  incidentHistory.unshift(resolvedIncident);
  activeIncident = null;
  return resolvedIncident;
}
