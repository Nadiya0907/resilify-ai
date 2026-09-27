import { updateServiceTelemetry, getServicesTelemetry } from './telemetryEngine.js';
import { getRunbookById } from './runbookService.js';
import { updateIncidentStatus } from './incidentDetector.js';

export async function simulateRemediationExecution(incident, runbookId, onStepProgress) {
  if (!incident) throw new Error('No incident provided for remediation simulation.');

  const runbook = getRunbookById(runbookId);
  const targetService = incident.service;

  updateIncidentStatus('REMEDIATING', `Engineer approved execution of Runbook ${runbook.id}`);

  const stepLogs = [];
  const telemetrySteps = [
    { errorRate: 28.4, latencyMs: 3200, dbConnections: '78/100', cpuUsage: 78.5 },
    { errorRate: 14.1, latencyMs: 1450, dbConnections: '45/100', cpuUsage: 54.0 },
    { errorRate: 4.2, latencyMs: 420, dbConnections: '28/100', cpuUsage: 36.2 },
    { errorRate: 0.3, latencyMs: 45, dbConnections: '18/100', cpuUsage: 22.4 }
  ];

  for (let i = 0; i < runbook.steps.length; i++) {
    const stepText = runbook.steps[i];
    await new Promise(resolve => setTimeout(resolve, 800)); // 800ms simulation delay per step

    stepLogs.push({
      stepNumber: i + 1,
      stepText,
      status: 'COMPLETED',
      completedAt: new Date().toLocaleTimeString()
    });

    const metrics = telemetrySteps[i] || telemetrySteps[telemetrySteps.length - 1];
    updateServiceTelemetry(targetService, metrics);

    updateIncidentStatus('REMEDIATING', `✓ ${stepText} (Completed)`);

    if (onStepProgress) {
      onStepProgress({
        stepNumber: i + 1,
        totalSteps: runbook.steps.length,
        stepText,
        telemetrySnapshot: getServicesTelemetry().find(s => s.id === targetService)
      });
    }
  }

  // Set final healthy telemetry
  updateServiceTelemetry(targetService, {
    status: 'HEALTHY',
    cpuUsage: 22.4,
    memoryUsage: 41.8,
    errorRate: 0.01,
    latencyMs: 45,
    dbConnections: '18/100'
  });

  updateIncidentStatus('VERIFYING', 'Remediation steps completed. Triggering recovery verification protocol...');

  return {
    success: true,
    runbookId: runbook.id,
    runbookTitle: runbook.title,
    executedSteps: stepLogs,
    finalTelemetry: getServicesTelemetry().find(s => s.id === targetService)
  };
}
