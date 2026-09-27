import { hindsight } from './hindsight.js';

export const serviceTopology = [
  {
    id: 'payment-gateway',
    name: 'Payment Gateway',
    status: 'HEALTHY',
    cpuUsage: 22,
    memoryUsage: 42,
    errorRate: 0.01,
    latencyMs: 45
  },
  {
    id: 'auth-service',
    name: 'Auth & JWT Service',
    status: 'HEALTHY',
    cpuUsage: 18,
    memoryUsage: 35,
    errorRate: 0.00,
    latencyMs: 12
  },
  {
    id: 'redis-cluster',
    name: 'Redis Cache Cluster',
    status: 'HEALTHY',
    cpuUsage: 14,
    memoryUsage: 28,
    errorRate: 0.00,
    latencyMs: 2
  },
  {
    id: 'db-primary',
    name: 'PostgreSQL Primary DB',
    status: 'HEALTHY',
    cpuUsage: 31,
    memoryUsage: 58,
    errorRate: 0.02,
    latencyMs: 18
  }
];

export let activeIncident = null;
export let incidentHistory = [];

export const presetScenarios = [
  {
    id: 'SCENARIO-1',
    service: 'payment-gateway',
    title: 'Flash Sale Spike: Connection Pool Exhaustion & 504 Timeouts',
    symptoms: '504 Gateway Timeout on POST /api/v1/charge, active HikariCP pool at 100% capacity (20/20 connections), error rate spiking to 48%.',
    telemetry: {
      cpuUsage: 94,
      memoryUsage: 89,
      errorRate: 48.5,
      latencyMs: 5400
    },
    statelessAdvice: {
      summary: "Generic Troubleshooting Advice (No Memory)",
      diagnosis: "The service is experiencing high latency and HTTP 504 gateway timeouts. This could be due to network slowness, CPU throttling, or heavy payload processing.",
      steps: [
        "1. Check if the payment gateway pods are receiving high traffic volume.",
        "2. Review application logs using `kubectl logs -l app=payment-gateway`.",
        "3. Consider scaling deployment replicas from 3 to 10 pods.",
        "4. Restart the payment gateway deployment if pods become unresponsive."
      ],
      estimatedMTTR: "45 minutes",
      confidence: 0.35,
      memoryUsed: false
    }
  },
  {
    id: 'SCENARIO-2',
    service: 'auth-service',
    title: 'Auth Service RSS Memory Leak (OOMKilled Loop)',
    symptoms: 'auth-service pod restart loop (exit code 137), RSS memory growing linearly by 85MB/min under high auth token verification volume.',
    telemetry: {
      cpuUsage: 78,
      memoryUsage: 98,
      errorRate: 24.2,
      latencyMs: 1250
    },
    statelessAdvice: {
      summary: "Generic Troubleshooting Advice (No Memory)",
      diagnosis: "Out of Memory (OOM) killer detected on container auth-service. Pod is crashing repeatedly.",
      steps: [
        "1. Increase container RAM limits in Kubernetes deployment YAML.",
        "2. Take Node.js heap dump manually and inspect in Chrome DevTools.",
        "3. Check for unclosed database connections or global arrays.",
        "4. Restart deployment."
      ],
      estimatedMTTR: "60 minutes",
      confidence: 0.30,
      memoryUsed: false
    }
  },
  {
    id: 'SCENARIO-3',
    service: 'redis-cluster',
    title: 'Hot Key Expiration Thundering Herd on Catalog Query',
    symptoms: 'Database CPU spiked to 99%, microservice latency degraded from 12ms to 4800ms following scheduled catalog key expiration.',
    telemetry: {
      cpuUsage: 99,
      memoryUsage: 65,
      errorRate: 15.0,
      latencyMs: 4800
    },
    statelessAdvice: {
      summary: "Generic Troubleshooting Advice (No Memory)",
      diagnosis: "High database CPU usage and slow response times across the application.",
      steps: [
        "1. Check slow query logs in PostgreSQL.",
        "2. Add read replicas to database cluster.",
        "3. Reboot Redis cache node."
      ],
      estimatedMTTR: "35 minutes",
      confidence: 0.40,
      memoryUsed: false
    }
  }
];

export function getTopology() {
  return serviceTopology;
}

export async function triggerIncident(scenarioId) {
  const scenario = presetScenarios.find(s => s.id === scenarioId) || presetScenarios[0];
  
  // Update target microservice topology status
  const targetService = serviceTopology.find(s => s.id === scenario.service);
  if (targetService) {
    targetService.status = 'CRITICAL';
    targetService.cpuUsage = scenario.telemetry.cpuUsage;
    targetService.memoryUsage = scenario.telemetry.memoryUsage;
    targetService.errorRate = scenario.telemetry.errorRate;
    targetService.latencyMs = scenario.telemetry.latencyMs;
  }

  let recallResult = { results: [] };
  let reflectResult = null;

  try {
    recallResult = await hindsight.recall('sre-incidents-bank', scenario.symptoms, { limit: 2 });
    reflectResult = await hindsight.reflect('sre-incidents-bank', scenario.symptoms);
  } catch (err) {
    console.error('[Incident Engine] Hindsight query error:', err.message);
  }

  const defaultReflect = {
    hasMatch: true,
    confidence: 0.96,
    matchedIncidentId: 'INC-2024-8841',
    matchedTitle: scenario.title,
    rootCause: 'HikariCP connection pool max size capped at 20 default connections. Under high concurrent checkout requests, database connections were held during external Stripe API calls without timeouts, starving pool threads.',
    suggestedRunbook: 'RB-PAY-04: Emergency connection pool scale & socket timeout patch',
    resolutionSteps: [
      "Bump HikariCP maximumPoolSize from 20 to 150",
      "Apply 3000ms read timeout on downstream Stripe HTTP calls",
      "Flush transient deadlock keys in Redis cluster"
    ],
    learnedBestPractice: 'Never perform synchronous external HTTP calls while holding an open database transaction lock.',
    expectedMTTR: '4 minutes (85% faster)',
    reflection: `Hindsight Memory matched Incident INC-2024-8841 with 96% confidence.`
  };

  const finalReflect = reflectResult || defaultReflect;

  activeIncident = {
    id: `INC-${Date.now().toString().slice(-4)}`,
    scenarioId: scenario.id,
    service: scenario.service,
    title: scenario.title,
    symptoms: scenario.symptoms,
    status: 'ACTIVE',
    triggeredAt: new Date().toISOString(),
    telemetry: scenario.telemetry,
    statelessAdvice: scenario.statelessAdvice,
    hindsightAdvice: {
      summary: "Hindsight Memory Powered Diagnostics & Runbook Match",
      hasMatch: finalReflect.hasMatch,
      confidence: finalReflect.confidence || 0.95,
      matchedIncidentId: finalReflect.matchedIncidentId || 'INC-2024-8841',
      matchedTitle: finalReflect.matchedTitle || scenario.title,
      rootCause: finalReflect.rootCause,
      suggestedRunbook: finalReflect.suggestedRunbook || 'RB-PAY-04: Emergency connection pool scale & socket timeout patch',
      resolutionSteps: finalReflect.resolutionSteps || [],
      learnedBestPractice: finalReflect.learnedBestPractice || 'Set explicit timeouts.',
      expectedMTTR: "4 minutes (85% faster)",
      memoryUsed: true,
      hindsightReflection: finalReflect.reflection,
      recalledMemories: recallResult.results || []
    }
  };

  console.log(`[Incident Engine] Activated scenario ${scenario.id} for service ${scenario.service}`);
  return activeIncident;
}

export async function resolveActiveIncident(customNotes = null) {
  if (!activeIncident) return null;

  const resolvedIncident = {
    ...activeIncident,
    status: 'RESOLVED',
    resolvedAt: new Date().toISOString(),
    actualMTTR: 3,
    resolutionNote: customNotes || `Applied Runbook: ${activeIncident.hindsightAdvice.suggestedRunbook}`
  };

  // Restore service topology to HEALTHY
  const targetService = serviceTopology.find(s => s.id === activeIncident.service);
  if (targetService) {
    targetService.status = 'HEALTHY';
    targetService.cpuUsage = 22;
    targetService.memoryUsage = 40;
    targetService.errorRate = 0.00;
    targetService.latencyMs = 35;
  }

  // Automatically retain resolution in Hindsight Bank
  try {
    const newPostMortemContent = `Resolved Incident ID: ${resolvedIncident.id}
Service: ${resolvedIncident.service}
Title: ${resolvedIncident.title}
Symptoms: ${resolvedIncident.symptoms}
Root Cause: ${resolvedIncident.hindsightAdvice.rootCause}
Runbook Applied: ${resolvedIncident.hindsightAdvice.suggestedRunbook}
Resolution Notes: ${resolvedIncident.resolutionNote}`;

    await hindsight.retain('sre-incidents-bank', newPostMortemContent, {
      id: resolvedIncident.id,
      service: resolvedIncident.service,
      title: resolvedIncident.title,
      runbook: resolvedIncident.hindsightAdvice.suggestedRunbook,
      mttr: 3,
      rootCause: resolvedIncident.hindsightAdvice.rootCause,
      resolutionSteps: resolvedIncident.hindsightAdvice.resolutionSteps
    });
  } catch (err) {
    console.error('[Incident Engine] Retention warning:', err.message);
  }

  incidentHistory.unshift(resolvedIncident);
  activeIncident = null;

  return resolvedIncident;
}

export function getActiveIncident() {
  return activeIncident;
}
