import React, { useState } from 'react';
import { Brain, Bot, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, Sparkles, Clock, FileText, Download, TrendingDown, DollarSign } from 'lucide-react';

export default function MemoryComparisonView({ incident, onResolveIncident, isResolving }) {
  const [resolutionExecuted, setResolutionExecuted] = useState(false);
  const [resolutionResult, setResolutionResult] = useState(null);

  if (!incident) {
    return (
      <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', marginBottom: '24px' }}>
        <Brain size={48} color="var(--accent-cyan)" style={{ margin: '0 auto 16px auto', opacity: 0.8 }} />
        <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '8px' }}>
          No Active Production Incident
        </h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto 20px auto' }}>
          Select a scenario above to simulate a live production outage and see how Vectorize Hindsight Memory transforms SRE incident response in real-time.
        </p>
      </div>
    );
  }

  const stateless = incident.statelessAdvice;
  const hindsight = incident.hindsightAdvice;

  const handleExecuteRunbook = async () => {
    if (onResolveIncident) {
      const res = await onResolveIncident();
      if (res) {
        setResolutionExecuted(true);
        setResolutionResult(res);
      }
    }
  };

  const handleExportPostMortem = () => {
    const postMortemMd = `# OFFICIAL SRE INCIDENT POST-MORTEM REPORT
**Incident ID**: ${incident.id}
**Target Microservice**: ${incident.service}
**Triggered Timestamp**: ${new Date(incident.triggeredAt).toUTCString()}
**Resolved Timestamp**: ${new Date().toUTCString()}
**MTTR Achieved**: 3 minutes (85% reduction vs 45 min baseline)
**Estimated Cost Saved**: $42,500 USD

---

## 1. Executive Summary
During peak traffic, service \`${incident.service}\` suffered a critical outage (${incident.title}). 
Resilify.AI powered by **Vectorize Hindsight Memory** matched historical Incident #${hindsight.matchedIncidentId} with ${Math.round((hindsight.confidence || 0.95) * 100)}% pattern similarity and executed automated Runbook \`${hindsight.suggestedRunbook}\`.

---

## 2. Telemetry & Symptoms
${incident.symptoms}

---

## 3. Pinpointed Root Cause
${hindsight.rootCause}

---

## 4. Resolution Steps Executed
${(hindsight.resolutionSteps || []).map(step => `- ${step}`).join('\n')}

---

## 5. Hindsight Memory Retention
This incident post-mortem has been retained into Hindsight Memory Bank \`sre-incidents-bank\` for future automated recall.
`;

    const blob = new Blob([postMortemMd], { type: 'text/markdown' });
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
      
      {/* Active Outage Banner */}
      <div className="glass-panel" style={{ 
        padding: '20px', 
        marginBottom: '20px',
        border: '1px solid rgba(244,63,94,0.6)',
        background: 'linear-gradient(135deg, rgba(244,63,94,0.1) 0%, rgba(18,24,36,0.9) 100%)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ 
              padding: '10px', 
              borderRadius: '50%', 
              background: 'rgba(244,63,94,0.2)',
              color: 'var(--accent-rose)',
              boxShadow: '0 0 15px rgba(244,63,94,0.4)'
            }}>
              <AlertTriangle size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="font-mono" style={{ fontSize: '0.8rem', background: 'rgba(244,63,94,0.2)', color: 'var(--accent-rose)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                  CRITICAL OUTAGE #{incident.id}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Target: <strong style={{ color: '#fff' }}>{incident.service}</strong>
                </span>
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '4px', color: '#fff' }}>
                {incident.title}
              </h3>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Telemetry Alert Triggered</span>
            <span className="font-mono" style={{ fontSize: '0.85rem', color: 'var(--accent-amber)', fontWeight: 600 }}>
              {new Date(incident.triggeredAt).toLocaleTimeString()}
            </span>
          </div>
        </div>

        {/* Symptoms bar */}
        <div style={{ 
          marginTop: '14px', 
          padding: '12px', 
          borderRadius: '6px', 
          background: 'rgba(0,0,0,0.3)', 
          fontSize: '0.85rem',
          borderLeft: '3px solid var(--accent-rose)'
        }}>
          <strong style={{ color: 'var(--accent-rose)' }}>Detected Symptoms: </strong>
          <span style={{ color: 'var(--text-main)' }}>{incident.symptoms}</span>
        </div>
      </div>

      {/* Side-by-Side Comparison Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
        <Sparkles size={20} color="var(--accent-cyan)" />
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, textAlign: 'center' }}>
          Hindsight Memory Showcase: <span className="glow-cyan">Stateless AI vs. Resilify Memory Agent</span>
        </h2>
      </div>

      {/* Side-by-Side Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px' }}>
        
        {/* LEFT COLUMN: Stateless Agent (No Memory) */}
        <div className="glass-panel" style={{ 
          padding: '24px', 
          border: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(255,255,255,0.02)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Bot size={22} color="var(--text-muted)" />
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Stateless AI Agent</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Standard LLM (No Memory Layer)</span>
              </div>
            </div>
            <span style={{ 
              fontSize: '0.75rem', 
              background: 'rgba(255,255,255,0.05)', 
              color: 'var(--text-muted)', 
              padding: '4px 10px', 
              borderRadius: '12px',
              border: '1px solid var(--border-color)'
            }}>
              Zero History Context
            </span>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
              Generic Diagnosis
            </h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: '1.5' }}>
              {stateless.diagnosis}
            </p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
              Standard Suggested Troubleshooting
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {stateless.steps.map((step, idx) => (
                <li key={idx} style={{ 
                  fontSize: '0.85rem', 
                  color: 'var(--text-muted)', 
                  background: 'rgba(0,0,0,0.2)', 
                  padding: '8px 12px', 
                  borderRadius: '6px' 
                }}>
                  {step}
                </li>
              ))}
            </ul>
          </div>

          <div style={{ 
            padding: '12px', 
            borderRadius: '8px', 
            background: 'rgba(245,158,11,0.08)', 
            border: '1px solid rgba(245,158,11,0.2)',
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--accent-amber)' }}>Estimated SRE MTTR:</span>
            <span className="font-mono" style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-amber)' }}>
              {stateless.estimatedMTTR}
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: Resilify AI (Powered by Hindsight Memory) */}
        <div className="glass-panel" style={{ 
          padding: '24px', 
          border: '1px solid rgba(0,240,255,0.4)',
          background: 'linear-gradient(135deg, rgba(0,240,255,0.05) 0%, rgba(18,24,36,0.95) 100%)',
          boxShadow: '0 0 25px rgba(0,240,255,0.15)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid rgba(0,240,255,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Brain size={24} className="glow-cyan" />
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }} className="glow-cyan">
                  Resilify Agent + Hindsight
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>
                  Persistent Memory & Vectorized Pattern Match
                </span>
              </div>
            </div>

            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              background: 'rgba(16,185,129,0.15)', 
              color: 'var(--accent-emerald)', 
              padding: '4px 10px', 
              borderRadius: '12px',
              border: '1px solid rgba(16,185,129,0.4)',
              fontWeight: 700,
              fontSize: '0.8rem'
            }}>
              <ShieldCheck size={14} />
              {Math.round((hindsight.confidence || 0.95) * 100)}% Memory Match
            </div>
          </div>

          {/* Historical Incident Recalled */}
          <div style={{ 
            background: 'rgba(0,240,255,0.06)', 
            border: '1px solid rgba(0,240,255,0.2)', 
            padding: '12px', 
            borderRadius: '8px', 
            marginBottom: '16px' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <FileText size={16} color="var(--accent-cyan)" />
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                Recalled Hindsight Post-Mortem #{hindsight.matchedIncidentId}
              </span>
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>
              "{hindsight.matchedTitle}"
            </div>
          </div>

          {/* Pinpointed Root Cause */}
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
              Pinpointed Root Cause (From Past Learning)
            </h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: '1.5', background: 'rgba(0,0,0,0.3)', padding: '10px 12px', borderRadius: '6px' }}>
              {hindsight.rootCause}
            </p>
          </div>

          {/* Suggested Runbook */}
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
              Recommended Verified Runbook
            </h4>
            <div className="font-mono" style={{ 
              fontSize: '0.85rem', 
              color: 'var(--accent-emerald)', 
              background: 'rgba(16,185,129,0.1)', 
              padding: '10px 12px', 
              borderRadius: '6px',
              border: '1px dashed rgba(16,185,129,0.4)',
              fontWeight: 600
            }}>
              {hindsight.suggestedRunbook}
            </div>
          </div>

          {/* MTTR Comparison Box */}
          <div style={{ 
            padding: '12px', 
            borderRadius: '8px', 
            background: 'rgba(16,185,129,0.15)', 
            border: '1px solid rgba(16,185,129,0.4)',
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={16} color="var(--accent-emerald)" />
              <span style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>Accelerated MTTR:</span>
            </div>
            <span className="font-mono" style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
              {hindsight.expectedMTTR}
            </span>
          </div>

          {/* Runbook Execution & Export Post-Mortem Buttons */}
          {!resolutionExecuted ? (
            <button 
              className="btn btn-primary" 
              onClick={handleExecuteRunbook}
              disabled={isResolving}
              style={{ 
                width: '100%', 
                justify: 'center', 
                padding: '14px', 
                fontSize: '0.95rem',
                letterSpacing: '0.02em'
              }}
            >
              <Sparkles size={18} />
              {isResolving ? 'Executing Runbook & Retaining Memory...' : `Execute ${hindsight.suggestedRunbook}`}
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ 
                padding: '16px', 
                borderRadius: '8px', 
                background: 'rgba(16,185,129,0.2)', 
                border: '1px solid var(--accent-emerald)',
                textAlign: 'center'
              }}>
                <CheckCircle2 size={24} color="var(--accent-emerald)" style={{ margin: '0 auto 8px auto' }} />
                <h4 style={{ fontSize: '1rem', color: 'var(--accent-emerald)', fontWeight: 700 }}>
                  Incident Successfully Resolved!
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Actual MTTR: 3 mins. Resolution retain executed into Hindsight Memory Bank.
                </p>
              </div>

              {/* 1-Click Executive Post-Mortem Exporter */}
              <button 
                className="btn btn-secondary" 
                onClick={handleExportPostMortem}
                style={{ width: '100%', justifyContent: 'center', padding: '10px', fontSize: '0.85rem' }}
              >
                <Download size={14} color="var(--accent-cyan)" />
                Export Official Incident Post-Mortem (.md)
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
