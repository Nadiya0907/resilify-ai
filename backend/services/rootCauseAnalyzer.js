import { hindsightService } from './hindsightService.js';

export async function analyzeRootCause(incident) {
  if (!incident) return null;

  const bank = 'sre-incidents-bank';

  // ---------------------------------------------------------
  // 1. RECALL: Search Hindsight for historical incidents
  // ---------------------------------------------------------
  const recallResult = await hindsightService.recallMemory(
    bank,
    incident.symptoms,
    { limit: 3 }
  );

  // ---------------------------------------------------------
  // 2. REFLECT: Let Hindsight synthesize the best match
  // ---------------------------------------------------------
  const reflectResult =
    await hindsightService.reflectOnMemories(
      bank,
      incident.symptoms
    );

  const recalledResults = recallResult?.results || [];

  // ---------------------------------------------------------
  // 3. Convert actual Hindsight memories into RCA matches
  // ---------------------------------------------------------
  const historicalMatches = recalledResults.map((memory) => {
    const metadata = memory.metadata || {};

    const mttr =
      metadata.mttr !== undefined &&
      metadata.mttr !== null
        ? metadata.mttr
        : null;

    const runbook =
      metadata.runbook ||
      null;

    const resolutionSteps =
      Array.isArray(metadata.resolutionSteps)
        ? metadata.resolutionSteps
        : [];

    return {
      id: memory.id,

      date: new Date(
        memory.createdAt || Date.now()
      )
        .toISOString()
        .split('T')[0],

      service:
        metadata.service ||
        incident.service,

      symptoms:
        metadata.symptoms ||
        memory.content?.substring(0, 120) ||
        'Historical incident memory',

      rootCause:
        metadata.rootCause ||
        'Root cause information was not stored in this historical memory.',

      resolution:
        runbook ||
        'No historical runbook recorded.',

      resolutionSteps,

      outcome:
        mttr !== null
          ? `Service recovered successfully. Historical MTTR: ${mttr} minutes.`
          : 'Historical resolution recorded; MTTR was not available.',

      mttr,

      score:
        typeof memory.score === 'number'
          ? memory.score
          : 0,

      mode:
        recallResult?.mode || 'unknown'
    };
  });

  // ---------------------------------------------------------
  // 4. IMPORTANT:
  // Do NOT fabricate a historical incident when Hindsight
  // returns no matches.
  // ---------------------------------------------------------
  if (historicalMatches.length === 0) {
    return {
      incidentId: incident.id,

      likelyRootCause:
        reflectResult?.rootCause ||
        'No historical Hindsight memory matched this incident pattern.',

      confidenceScore:
        reflectResult?.confidence || 0,

      supportingEvidence: [
        `Database connection utilization: ${
          incident.telemetrySnapshot?.dbConnections ||
          'Unavailable'
        }`,

        `API P99 latency: ${
          incident.telemetrySnapshot?.latencyMs ??
          'Unavailable'
        }ms`,

        `HTTP 5xx error rate: ${
          incident.telemetrySnapshot?.errorRate ??
          'Unavailable'
        }%`,

        'No historical Hindsight memory match was returned.'
      ],

      alternativeCauses: [
        'Upstream dependency or network timeout',
        'Application resource exhaustion'
      ],

      historicalMatches: [],

      whyRecommendation: {
        historicalIncidentId: null,

        matchingSignals: [
          'No historical Hindsight match available.'
        ],

        previousResolutionSteps: [],

        previousOutcome:
          'No previous incident outcome was retrieved from Hindsight.'
      },

      recommendedRunbookId: null,

      recommendedRunbookTitle:
        'No historical runbook recommendation available',

      hindsightMode:
        recallResult?.mode || 'unknown',

      hindsightAvailable: false
    };
  }

  // ---------------------------------------------------------
  // 5. Use the REAL top Hindsight match
  // ---------------------------------------------------------
  const primaryMatch = historicalMatches[0];

  const serviceMatches =
    primaryMatch.service &&
    incident.service &&
    primaryMatch.service.toLowerCase() ===
      incident.service.toLowerCase();

  // ---------------------------------------------------------
  // 6. Supporting evidence
  // ---------------------------------------------------------
  const supportingEvidence = [
    `Database connection utilization: ${
      incident.telemetrySnapshot?.dbConnections ||
      'Unavailable'
    }`,

    `API P99 latency: ${
      incident.telemetrySnapshot?.latencyMs ??
      'Unavailable'
    }ms`,

    `HTTP 5xx error rate: ${
      incident.telemetrySnapshot?.errorRate ??
      'Unavailable'
    }%`,

    `Historical Hindsight match found: ${
      primaryMatch.id
    } (${Math.round(primaryMatch.score * 100)}% similarity)`,

    primaryMatch.mttr !== null
      ? `Historical incident MTTR: ${primaryMatch.mttr} minutes`
      : 'Historical incident MTTR was not recorded.'
  ];

  // ---------------------------------------------------------
  // 7. Build matching signals from actual information
  // ---------------------------------------------------------
  const matchingSignals = [];

  if (serviceMatches) {
    matchingSignals.push(
      `✓ Same microservice target (${incident.service})`
    );
  } else {
    matchingSignals.push(
      `Historical service: ${
        primaryMatch.service || 'Unknown'
      }`
    );
  }

  matchingSignals.push(
    `✓ Hindsight similarity score: ${
      Math.round(primaryMatch.score * 100)
    }%`
  );

  if (
    incident.telemetrySnapshot?.dbConnections
  ) {
    matchingSignals.push(
      `Current DB connection saturation: ${
        incident.telemetrySnapshot.dbConnections
      }`
    );
  }

  if (
    incident.deploymentVersion
  ) {
    matchingSignals.push(
      `Current deployment: ${
        incident.deploymentVersion
      }`
    );
  }

  // ---------------------------------------------------------
  // 8. Previous resolution steps
  // ---------------------------------------------------------
  const previousResolutionSteps =
    primaryMatch.resolutionSteps.length > 0
      ? primaryMatch.resolutionSteps.map(
          (step, index) =>
            `${index + 1}. ${step}`
        )
      : primaryMatch.resolution
        ? [primaryMatch.resolution]
        : [];

  // ---------------------------------------------------------
  // 9. Previous outcome
  // ---------------------------------------------------------
  const previousOutcome =
    primaryMatch.mttr !== null
      ? `Historical service recovery recorded with MTTR of ${primaryMatch.mttr} minutes.`
      : 'Historical service recovery was recorded, but MTTR was not available.';

  // ---------------------------------------------------------
  // 10. Return RCA using REAL Hindsight data
  // ---------------------------------------------------------
  return {
    incidentId: incident.id,

    likelyRootCause:
      primaryMatch.rootCause,

    confidenceScore:
      primaryMatch.score,

    supportingEvidence,

    alternativeCauses: [
      'Upstream dependency or network timeout',
      'Application resource exhaustion'
    ],

    historicalMatches,

    whyRecommendation: {
      historicalIncidentId:
        primaryMatch.id,

      matchingSignals,

      previousResolutionSteps,

      previousOutcome
    },

    recommendedRunbookId:
      primaryMatch.resolution &&
      primaryMatch.resolution.includes(':')
        ? primaryMatch.resolution.split(':')[0].trim()
        : primaryMatch.resolution || null,

    recommendedRunbookTitle:
      primaryMatch.resolution ||
      'Historical runbook information unavailable',

    hindsightMode:
      recallResult?.mode || 'unknown',

    hindsightAvailable: true
  };
}
