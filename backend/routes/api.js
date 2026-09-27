import express from 'express';
import { hindsightService } from '../services/hindsightService.js';
import { getServicesTelemetry, resetServicesTelemetry } from '../services/telemetryEngine.js';
import { 
  getActiveIncident, 
  getIncidentHistory, 
  createIncidentFromTelemetry, 
  updateIncidentStatus, 
  archiveActiveIncident 
} from '../services/incidentDetector.js';
import { analyzeRootCause } from '../services/rootCauseAnalyzer.js';
import { getAllRunbooks, getRunbookById } from '../services/runbookService.js';
import { simulateRemediationExecution } from '../services/remediationSimulator.js';
import { verifyRecovery } from '../services/recoveryVerifier.js';
import { generatePostMortem } from '../services/postmortemGenerator.js';
import { getReplayScenarios, getReplayScenarioById } from '../services/incidentReplay.js';

const router = express.Router();

// 1. Status & Hindsight Config
router.get('/status', async (req, res) => {
  try {
    const stats = await hindsightService.getStats('sre-incidents-bank');
    const modeInfo = hindsightService.getModeInfo();
    res.json({ success: true, modeInfo, stats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Microservice Topology Stream
router.get('/topology', (req, res) => {
  res.json({
    success: true,
    topology: getServicesTelemetry(),
    activeIncident: getActiveIncident()
  });
});

// Reset system to healthy
router.post('/topology/reset', (req, res) => {
  resetServicesTelemetry();
  archiveActiveIncident({ actualMTTR: 0, runbookId: 'SYSTEM_RESET', postMortem: null });
  res.json({ success: true, message: 'System restored to HEALTHY state.', topology: getServicesTelemetry() });
});

// 3. Replay Scenarios
router.get('/replays', (req, res) => {
  res.json({ success: true, replays: getReplayScenarios() });
});

// 4. Trigger Replay Scenario
router.post('/incidents/trigger-replay', async (req, res) => {
  try {
    const { scenarioId } = req.body;
    const scenario = getReplayScenarioById(scenarioId);
    const incident = createIncidentFromTelemetry(scenario.service, scenario);

    // Perform background root cause analysis
    const rca = await analyzeRootCause(incident);
    incident.analysis = rca;

    res.json({
      success: true,
      message: `Incident ${incident.id} triggered successfully. Status: ${incident.status}`,
      incident
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Get Active Incident
router.get('/incidents/active', async (req, res) => {
  const incident = getActiveIncident();
  if (incident && !incident.analysis) {
    incident.analysis = await analyzeRootCause(incident);
  }
  res.json({ success: true, activeIncident: incident });
});

// 6. Root Cause Analysis Endpoint
router.post('/incidents/analyze', async (req, res) => {
  try {
    const incident = getActiveIncident();
    if (!incident) {
      return res.status(404).json({ success: false, message: 'No active incident to analyze.' });
    }
    const analysis = await analyzeRootCause(incident);
    incident.analysis = analysis;
    updateIncidentStatus('INVESTIGATING', 'Root cause hypothesis generated via Hindsight recall');

    res.json({ success: true, analysis });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Runbooks
router.get('/runbooks', (req, res) => {
  res.json({ success: true, runbooks: getAllRunbooks() });
});

router.get('/runbooks/:id', (req, res) => {
  const runbook = getRunbookById(req.params.id);
  res.json({ success: true, runbook });
});

// 8. Execute Safe Remediation Simulation
router.post('/remediation/execute', async (req, res) => {
  try {
    const incident = getActiveIncident();
    if (!incident) {
      return res.status(400).json({ success: false, message: 'No active incident for remediation execution.' });
    }
    const { runbookId } = req.body;
    const result = await simulateRemediationExecution(incident, runbookId || incident.analysis?.recommendedRunbookId || 'RB-PAY-04');
    
    // Auto perform verification
    const verification = verifyRecovery(incident);
    const rcaData = incident.analysis || await analyzeRootCause(incident);
    const postMortem = generatePostMortem(incident, rcaData, result, verification);

    // Auto retain in Hindsight
    const retainResult = await hindsightService.retainMemory('sre-incidents-bank', postMortem.markdownText, {
      id: incident.id,
      service: incident.service,
      title: incident.title,
      runbook: result.runbookId,
      mttr: 3,
      rootCause: rcaData.likelyRootCause,
      resolutionSteps: result.executedSteps.map(s => s.stepText)
    });

    updateIncidentStatus('RECOVERED', `Recovery verification passed: ${verification.statusLabel}`);
    const archived = archiveActiveIncident({
      actualMTTR: 3,
      runbookId: result.runbookId,
      postMortem
    });

    res.json({
      success: true,
      message: 'Remediation completed, recovery verified, post-mortem generated & retained into Hindsight.',
      remediationResult: result,
      verification,
      postMortem,
      retainResult,
      archivedIncident: archived
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 9. Incident History
router.get('/incidents/history', (req, res) => {
  res.json({ success: true, history: getIncidentHistory() });
});

// 10. Memory Explorer & Search
router.get('/memory', async (req, res) => {
  try {
    const data = await hindsightService.listMemories('sre-incidents-bank');
    res.json({ success: true, ...data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/memory/recall', async (req, res) => {
  try {
    const { query } = req.body;
    const recallData = await hindsightService.recallMemory('sre-incidents-bank', query || 'payment connection pool', { limit: 5 });
    res.json({ success: true, recallData });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/memory/retain', async (req, res) => {
  try {
    const { content, metadata } = req.body;
    const result = await hindsightService.retainMemory('sre-incidents-bank', content, metadata || {});
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
