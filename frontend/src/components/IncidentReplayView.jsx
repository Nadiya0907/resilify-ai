import React from 'react';
import { PlayCircle, ShieldAlert, Zap, Database, Server, GitBranch, ArrowRight } from 'lucide-react';

export default function IncidentReplayView({ replays = [], onSelectReplay, isTriggering }) {
  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <PlayCircle size={22} color="var(--accent-cyan)" />
          Deterministic Incident Replay Console (Hackathon Live Demo)
        </h2>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          Select an enterprise failure scenario to run the end-to-end flow: Telemetry → Detection → Hindsight Recall → RCA → Runbook → Engineer Approval → Safe Remediation → Recovery → Retain.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        {replays.map(sc => (
          <div 
            key={sc.id} 
            style={{ 
              background: 'rgba(255,255,255,0.02)', 
              border: '1px solid var(--border-color)', 
              borderRadius: '10px', 
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '12px',
              transition: 'all 0.2s ease'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="font-mono" style={{ fontSize: '0.72rem', background: 'rgba(0,240,255,0.1)', color: 'var(--accent-cyan)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                  {sc.service}
                </span>
                <span style={{ fontSize: '0.7rem', background: 'rgba(244,63,94,0.15)', color: 'var(--accent-rose)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                  {sc.severity}
                </span>
              </div>

              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>
                {sc.title}
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                {sc.symptoms}
              </p>
            </div>

            {/* Metrics Snapshot */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr 1fr', 
              gap: '6px', 
              background: 'rgba(0,0,0,0.3)', 
              padding: '8px', 
              borderRadius: '6px',
              fontSize: '0.75rem' 
            }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block' }}>Error Rate:</span>
                <span className="font-mono" style={{ fontWeight: 700, color: 'var(--accent-rose)' }}>{sc.telemetry.errorRate}%</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block' }}>Latency:</span>
                <span className="font-mono" style={{ fontWeight: 700, color: 'var(--text-main)' }}>{sc.telemetry.latencyMs}ms</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block' }}>DB Conns:</span>
                <span className="font-mono" style={{ fontWeight: 700, color: 'var(--text-main)' }}>{sc.telemetry.dbConnections}</span>
              </div>
            </div>

            <button 
              className="btn btn-primary"
              disabled={isTriggering}
              onClick={() => onSelectReplay(sc.id)}
              style={{ width: '100%', justifyContent: 'center', fontSize: '0.85rem' }}
            >
              <PlayCircle size={15} />
              Replay {sc.title}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
