import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Brain, 
  CheckCircle2, 
  Clock, 
  FileText, 
  ShieldCheck, 
  Play, 
  Download, 
  Activity, 
  CheckSquare, 
  HelpCircle, 
  ArrowRight, 
  GitBranch, 
  Database,
  Terminal,
  RefreshCw
} from 'lucide-react';

export default function IncidentConsole({ incident, onExecuteRemediation, isExecuting }) {
  const [activeTab, setActiveTab] = useState('rca'); // rca, runbook, timeline, postmortem
  const [remediationLogs, setRemediationLogs] = useState([]);
  const [isResolved, setIsResolved] = useState(false);
  const [postMortemData, setPostMortemData] = useState(null);
  const [retainCount, setRetainCount] = useState(127);

  if (!incident) {
    return (
      <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', marginBottom: '24px' }}>
        <Brain size={48} color="var(--accent-cyan)" style={{ margin: '0 auto 16px auto', opacity: 0.8 }} />
        <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '8px' }}>
          No Active Incident Under Investigation
        </h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto 20px auto' }}>
          Select <strong>Incident Replay</strong> in the top navigation to launch a simulated SRE outage scenario.
        </p>
      </div>
    );
  }

  const analysis = incident.analysis || {};
  const why = analysis.whyRecommendation || {};
  const runbook = {
    id: analysis.recommendedRunbookId || 'RB-PAY-04',
    title: analysis.recommendedRunbookTitle || 'Payment Database Connection & Pool Recovery',
    safetyLevel: 'SAFE_SANDBOXED_SIMULATION',
    steps: [
      '1. Scale HikariCP maximumPoolSize from 20 to 150 via environment config override',
      '2. Apply 3000ms read timeout on downstream payment gateway HTTP client calls',
      '3. Trigger graceful rolling restart across payment-gateway microservice pods',
      '4. Verify database connection pool drop & monitor error rate normalization'
    ]
  };

  const handleApproveAndExecute = async () => {
    if (onExecuteRemediation) {
      const res = await onExecuteRemediation(runbook.id);
      if (res && res.success) {
        setIsResolved(true);
        setRemediationLogs(res.remediationResult?.executedSteps || []);
        setPostMortemData(res.postMortem);
        setRetainCount(prev => prev + 1);
      }
    }
  };

  const handleExportPostMortem = () => {
    if (!postMortemData) return;
    const blob = new Blob([postMortemData.markdownText || ''], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SRE_POSTMORTEM_${incident.id}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div style={{ marginBottom: '32px' }}>
      
      {/* INCIDENT HEADER CONSOLE */}
      <div className="glass-panel" style={{ 
        padding: '24px', 
        marginBottom: '20px',
        border: incident.status === 'RECOVERED' || isResolved ? '1px solid var(--accent-emerald)' : '1px solid rgba(244,63,94,0.6)',
        background: incident.status === 'RECOVERED' || isResolved 
          ? 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(18,24,36,0.95) 100%)' 
          : 'linear-gradient(135deg, rgba(244,63,94,0.12) 0%, rgba(18,24,36,0.95) 100%)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span className="font-mono" style={{ 
                fontSize: '0.85rem', 
                background: 'rgba(244,63,94,0.2)', 
                color: 'var(--accent-rose)', 
                padding: '3px 10px', 
                borderRadius: '6px', 
                fontWeight: 700 
              }}>
                {incident.id}
              </span>
              <span style={{ 
                fontSize: '0.75rem', 
                background: incident.severity === 'CRITICAL' ? 'rgba(244,63,94,0.2)' : 'rgba(245,158,11,0.2)', 
                color: incident.severity === 'CRITICAL' ? 'var(--accent-rose)' : 'var(--accent-amber)', 
                padding: '2px 8px', 
                borderRadius: '4px',
                fontWeight: 700
              }}>
                {incident.severity}
              </span>
              <span style={{ 
                fontSize: '0.75rem', 
                background: 'rgba(0,240,255,0.15)', 
                color: 'var(--accent-cyan)', 
                padding: '2px 8px', 
                borderRadius: '4px',
                fontWeight: 700
              }}>
                STATUS: {isResolved ? 'RECOVERED' : incident.status}
              </span>
            </div>

            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginTop: '8px', color: '#fff' }}>
              {incident.title}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              <span>Target: <strong style={{ color: '#fff' }}>{incident.service}</strong></span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <GitBranch size={13} color="var(--accent-cyan)" />
                <span className="font-mono">{incident.deploymentVersion || 'payment-v2.8.1'}</span>
              </span>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Incident Triggered</span>
            <span className="font-mono" style={{ fontSize: '0.9rem', color: 'var(--accent-amber)', fontWeight: 600 }}>
              {new Date(
  incident.triggeredAt || incident.timestamp || Date.now()
).toLocaleTimeString()}
            </span>
          </div>
        </div>

        {/* Live Telemetry Snapshot Bar */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', 
          gap: '12px', 
          marginTop: '16px', 
          paddingTop: '14px', 
          borderTop: '1px solid rgba(255,255,255,0.08)' 
        }}>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px 12px', borderRadius: '6px' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Error Rate</span>
            <span className="font-mono" style={{ fontSize: '0.95rem', fontWeight: 700, color: incident.telemetrySnapshot?.errorRate > 5 ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>
              {incident.telemetrySnapshot?.errorRate}%
            </span>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px 12px', borderRadius: '6px' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>P99 Latency</span>
            <span className="font-mono" style={{ fontSize: '0.95rem', fontWeight: 700, color: incident.telemetrySnapshot?.latencyMs > 1000 ? 'var(--accent-rose)' : 'var(--text-main)' }}>
              {incident.telemetrySnapshot?.latencyMs}ms
            </span>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px 12px', borderRadius: '6px' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>DB Connections</span>
            <span className="font-mono" style={{ fontSize: '0.95rem', fontWeight: 700, color: incident.telemetrySnapshot?.dbConnections === '100/100' ? 'var(--accent-rose)' : 'var(--text-main)' }}>
              {incident.telemetrySnapshot?.dbConnections || '100/100'}
            </span>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px 12px', borderRadius: '6px' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>CPU Usage</span>
            <span className="font-mono" style={{ fontSize: '0.95rem', fontWeight: 700, color: incident.telemetrySnapshot?.cpuUsage > 85 ? 'var(--accent-rose)' : 'var(--text-main)' }}>
              {incident.telemetrySnapshot?.cpuUsage}%
            </span>
          </div>
        </div>
      </div>

      {/* CONSOLE NAVIGATION TABS */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button 
          className={`btn ${activeTab === 'rca' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('rca')}
          style={{ fontSize: '0.85rem' }}
        >
          <Brain size={15} />
          Root Cause Analysis & Evidence
        </button>
        <button 
          className={`btn ${activeTab === 'runbook' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('runbook')}
          style={{ fontSize: '0.85rem' }}
        >
          <FileText size={15} />
          Recommended Runbook ({runbook.id})
        </button>
        <button 
          className={`btn ${activeTab === 'timeline' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('timeline')}
          style={{ fontSize: '0.85rem' }}
        >
          <Clock size={15} />
          Incident Timeline ({incident.timeline?.length || 0})
        </button>
        {isResolved && (
          <button 
            className={`btn ${activeTab === 'postmortem' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('postmortem')}
            style={{ fontSize: '0.85rem' }}
          >
            <CheckCircle2 size={15} color="var(--accent-emerald)" />
            Generated Post-Mortem
          </button>
        )}
      </div>

      {/* TAB 1: ROOT CAUSE ANALYSIS & EVIDENCE */}
      {activeTab === 'rca' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px' }}>
          
          {/* Likely Root Cause Card */}
          <div className="glass-panel" style={{ padding: '24px', border: '1px solid rgba(0,240,255,0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <Brain size={22} className="glow-cyan" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }} className="glow-cyan">
                Likely Root Cause Hypothesis
              </h3>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: '8px', borderLeft: '3px solid var(--accent-cyan)', marginBottom: '16px' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--accent-cyan)', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                Hindsight Memory Synthesized Diagnosis
              </span>
              <p style={{ fontSize: '0.92rem', color: '#fff', lineHeight: '1.5' }}>
                "{analysis.likelyRootCause || 'HikariCP connection pool max size was capped at 20 default connections. Under high concurrent checkout requests, database connections were held during external Stripe API calls without timeouts, starving pool threads.'}"
              </p>
            </div>

            {/* Supporting Evidence Checklist */}
            <div style={{ marginBottom: '18px' }}>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Supporting Evidence & Signals
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {(analysis.supportingEvidence || [
                  '✓ Database connection utilization at 100/100',
                  '✓ API P99 latency increased to 4820ms',
                  '✓ HTTP 5xx error rate spiked to 38.7%',
                  '✓ Historical Hindsight match found (INC-2025-087, 94% similarity)',
                  '✓ Previous runbook RB-PAY-04 succeeded with 3 min MTTR'
                ]).map((evidence, idx) => (
                  <li key={idx} style={{ fontSize: '0.85rem', color: 'var(--accent-emerald)', background: 'rgba(16,185,129,0.08)', padding: '8px 12px', borderRadius: '6px', fontWeight: 500 }}>
                    {evidence}
                  </li>
                ))}
              </ul>
            </div>

            {/* Alternative Possibilities */}
            <div>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                Alternative Possible Causes Considered
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {(analysis.alternativeCauses || [
                  'Upstream Stripe payment gateway network timeout',
                  'Transient memory heap fragmentation in Node.js event loop'
                ]).map((alt, idx) => (
                  <li key={idx} style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.03)', padding: '6px 10px', borderRadius: '4px' }}>
                    • {alt}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* WHY RESILIFY RECOMMENDS THIS Card */}
          <div className="glass-panel" style={{ padding: '24px', border: '1px solid rgba(168,85,247,0.3)', background: 'linear-gradient(135deg, rgba(168,85,247,0.05) 0%, rgba(18,24,36,0.95) 100%)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <HelpCircle size={22} color="var(--accent-purple)" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--accent-purple)' }}>
                WHY RESILIFY RECOMMENDS THIS
              </h3>
            </div>

            <div style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-purple)', fontWeight: 700, display: 'block', marginBottom: '2px' }}>
                Historical Incident Reference
              </span>
              <span className="font-mono" style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 700 }}>
                {why.historicalIncidentId || 'INC-2025-087'} (Resolved Outage)
              </span>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                Matching Signals
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {(why.matchingSignals || [
                  `✓ Same microservice target (${incident.service})`,
                  `✓ Same database connection saturation pattern (100/100)`,
                  `✓ Similar latency spike (> 4000ms)`,
                  `✓ Similar deployment condition (${incident.deploymentVersion})`
                ]).map((signal, idx) => (
                  <li key={idx} style={{ fontSize: '0.85rem', color: '#fff', background: 'rgba(0,0,0,0.3)', padding: '8px 12px', borderRadius: '6px' }}>
                    {signal}
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                Previous Tested Resolution Outcome
              </h4>
              <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', padding: '10px 12px', borderRadius: '6px', fontSize: '0.85rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>
                {why.previousOutcome || 'Service recovered successfully. MTTR reduced from 45 mins to 3 minutes.'}
              </div>
            </div>

            {/* ENGINEER APPROVAL BAR */}
            <div style={{ background: 'rgba(0,0,0,0.4)', padding: '16px', borderRadius: '8px', border: '1px dashed var(--accent-cyan)' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)', fontWeight: 700, display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>
                Engineer Approval Protocol
              </span>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                Remediation requires explicit engineer review before sandboxed execution begins.
              </p>

              {!isResolved ? (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => setActiveTab('rca')}
                    style={{ fontSize: '0.8rem' }}
                  >
                    View Evidence
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => setActiveTab('runbook')}
                    style={{ fontSize: '0.8rem' }}
                  >
                    View Runbook
                  </button>
                  <button 
                    className="btn btn-primary"
                    onClick={handleApproveAndExecute}
                    disabled={isExecuting}
                    style={{ fontSize: '0.85rem', fontWeight: 700 }}
                  >
                    <Play size={14} />
                    {isExecuting ? 'Executing Safe Remediation...' : 'APPROVE & EXECUTE'}
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-emerald)', fontWeight: 700 }}>
                  <CheckCircle2 size={18} />
                  Approved & Executed Successfully (RECOVERED)
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* TAB 2: RECOMMENDED RUNBOOK */}
      {activeTab === 'runbook' && (
        <div className="glass-panel" style={{ padding: '24px', border: '1px solid rgba(0,240,255,0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <span className="font-mono" style={{ fontSize: '0.8rem', background: 'rgba(0,240,255,0.12)', color: 'var(--accent-cyan)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                {runbook.id}
              </span>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '4px', color: '#fff' }}>
                {runbook.title}
              </h3>
            </div>
            <span style={{ fontSize: '0.75rem', background: 'rgba(16,185,129,0.15)', color: 'var(--accent-emerald)', padding: '4px 10px', borderRadius: '12px', fontWeight: 700 }}>
              {runbook.safetyLevel}
            </span>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
              Execution Steps Sequence
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {runbook.steps.map((step, idx) => (
                <li key={idx} style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '6px', fontSize: '0.9rem', color: '#fff', borderLeft: '3px solid var(--accent-cyan)' }}>
                  {step}
                </li>
              ))}
            </ul>
          </div>

          {!isResolved && (
            <button 
              className="btn btn-primary"
              onClick={handleApproveAndExecute}
              disabled={isExecuting}
              style={{ padding: '12px 20px', fontSize: '0.9rem' }}
            >
              <Play size={16} />
              {isExecuting ? 'Executing Simulation...' : `APPROVE & EXECUTE ${runbook.id}`}
            </button>
          )}
        </div>
      )}

      {/* TAB 3: VISUAL INCIDENT TIMELINE */}
      {activeTab === 'timeline' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} color="var(--accent-cyan)" />
            Visual Incident Timeline
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative', paddingLeft: '16px', borderLeft: '2px solid rgba(0,240,255,0.3)' }}>
            {(incident.timeline || []).map((item, idx) => (
              <div key={idx} style={{ position: 'relative', paddingLeft: '12px' }}>
                <div style={{ position: 'absolute', left: '-23px', top: '4px', width: '12px', height: '12px', borderRadius: '50%', background: 'var(--accent-cyan)', boxShadow: '0 0 10px var(--accent-cyan)' }}></div>
                <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                  {item.timestamp}
                </span>
                <p style={{ fontSize: '0.88rem', color: '#fff', marginTop: '2px' }}>
                  {item.event}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: GENERATED POST-MORTEM & HINDSIGHT RETAIN */}
      {activeTab === 'postmortem' && postMortemData && (
        <div className="glass-panel" style={{ padding: '24px', border: '1px solid var(--accent-emerald)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 size={24} color="var(--accent-emerald)" />
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                  Recovery Verified & Post-Mortem Generated
                </h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Incident resolution retained into Vectorize Hindsight Memory Bank
                </span>
              </div>
            </div>

            <button className="btn btn-secondary" onClick={handleExportPostMortem}>
              <Download size={15} color="var(--accent-cyan)" />
              Export Markdown (.md)
            </button>
          </div>

          {/* Retain Visualizer Indicator */}
          <div style={{ 
            background: 'rgba(16,185,129,0.12)', 
            border: '1px solid rgba(16,185,129,0.4)', 
            padding: '14px', 
            borderRadius: '8px', 
            marginBottom: '20px',
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: 700, textTransform: 'uppercase' }}>
                Hindsight Memory Retain Completed
              </span>
              <p style={{ fontSize: '0.85rem', color: '#fff', marginTop: '2px' }}>
                ✓ Incident stored • ✓ Root cause stored • ✓ Resolution stored • ✓ Outcome stored
              </p>
            </div>
            <div className="font-mono" style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Memory Count:</span>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                {retainCount - 1} → {retainCount}
              </span>
            </div>
          </div>

          {/* Markdown Post-Mortem Preview */}
          <pre className="font-mono" style={{ 
            background: 'rgba(0,0,0,0.4)', 
            padding: '16px', 
            borderRadius: '8px', 
            fontSize: '0.82rem', 
            color: 'var(--text-main)', 
            whiteSpace: 'pre-wrap',
            lineHeight: '1.5',
            maxHeight: '400px',
            overflowY: 'auto'
          }}>
            {postMortemData.markdownText}
          </pre>
        </div>
      )}

    </div>
  );
}
