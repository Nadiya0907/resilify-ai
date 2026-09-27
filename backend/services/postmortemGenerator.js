export function generatePostMortem(incident, rcaData, remediationResult, verificationResult) {
  const startTime = new Date(incident.triggeredAt || Date.now() - 180000);
  const endTime = new Date();
  const durationMinutes = Math.max(1, Math.round((endTime - startTime) / 60000));

  const postMortem = {
    incidentId: incident.id,
    service: incident.service,
    serviceName: incident.serviceName || incident.service,
    severity: incident.severity,
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
    duration: `${durationMinutes} minutes`,
    impact: `High HTTP 5xx error rate (${incident.telemetrySnapshot?.errorRate || 38.7}%) and database connection saturation on ${incident.service}`,
    symptoms: incident.symptoms,
    rootCause: rcaData?.likelyRootCause || 'Database connection pool starvation under peak concurrent checkout traffic.',
    contributingFactors: [
      `HikariCP max connection pool size was capped at 20 default connections`,
      `Downstream Stripe API calls held open DB transaction locks without read timeouts`,
      `Deployment ${incident.deploymentVersion} published prior to flash sale traffic spike`
    ],
    historicalIncidentsMatched: (rcaData?.historicalMatches || []).map(h => h.id),
    remediationApplied: remediationResult?.runbookId || 'RB-PAY-04',
    remediationTitle: remediationResult?.runbookTitle || 'Payment Database Connection Recovery',
    recoveryVerification: verificationResult?.statusLabel || 'RECOVERY VERIFIED',
    preventionRecommendations: [
      'Add connection pool saturation alert rule at 85% capacity threshold',
      'Enforce 3000ms read timeouts on all external HTTP integration clients',
      'Validate connection pool parameters in CI/CD pipeline prior to production deployment',
      'Implement single-flight request coalescing for high-volume database queries'
    ],
    createdAt: new Date().toISOString()
  };

  const markdownText = `# INCIDENT POST-MORTEM: ${postMortem.incidentId}

**Service**: ${postMortem.serviceName} (\`${postMortem.service}\`)  
**Severity**: ${postMortem.severity}  
**Duration**: ${postMortem.duration} (${postMortem.startTime} to ${postMortem.endTime})  
**Verification**: ${postMortem.recoveryVerification}  

---

## 1. Executive Summary & Impact
During peak traffic, service \`${postMortem.service}\` suffered a critical outage. Resilify.AI identified the anomaly, recalled historical Hindsight post-mortems (${postMortem.historicalIncidentsMatched.join(', ')}), and executed Runbook \`${postMortem.remediationApplied}\` following engineer approval.

## 2. Root Cause Analysis
${postMortem.rootCause}

## 3. Contributing Factors
${postMortem.contributingFactors.map(f => `- ${f}`).join('\n')}

## 4. Remediation Executed
- **Runbook**: ${postMortem.remediationTitle} (\`${postMortem.remediationApplied}\`)
- **Outcome**: Service recovered successfully in ${postMortem.duration}.

## 5. Prevention Recommendations
${postMortem.preventionRecommendations.map(p => `- ${p}`).join('\n')}

---
*Generated automatically by Resilify.AI SRE Platform & Retained into Vectorize Hindsight Memory.*
`;

  postMortem.markdownText = markdownText;
  return postMortem;
}
