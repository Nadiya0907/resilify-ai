import React from 'react';
import { Play, RotateCcw, AlertTriangle, ShieldAlert, Cpu } from 'lucide-react';

export default function ScenarioControlBar({ scenarios = [], activeIncident, onTrigger, onReset, isTriggering }) {
  return (
    <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={18} color="var(--accent-amber)" />
            Interactive Incident Simulation Engine (Judge Demo Tools)
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Select a real-world enterprise failure scenario to test Hindsight memory recall vs. Stateless AI
          </p>
        </div>

        {activeIncident && (
          <button 
            className="btn btn-secondary" 
            onClick={onReset}
            style={{ fontSize: '0.85rem' }}
          >
            <RotateCcw size={14} />
            Clear Active Incident
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
        {scenarios.map(sc => {
          const isActive = activeIncident?.scenarioId === sc.id;

          return (
            <div 
              key={sc.id} 
              style={{ 
                background: isActive ? 'rgba(244,63,94,0.1)' : 'rgba(255,255,255,0.02)', 
                border: isActive ? '1px solid var(--accent-rose)' : '1px solid var(--border-color)',
                borderRadius: '8px', 
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                justify: 'space-between',
                gap: '10px'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span className="font-mono" style={{ 
                    fontSize: '0.7rem', 
                    background: 'rgba(0,240,255,0.1)', 
                    color: 'var(--accent-cyan)', 
                    padding: '2px 8px', 
                    borderRadius: '4px',
                    fontWeight: 600
                  }}>
                    {sc.service}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                    Scenario ID: {sc.id}
                  </span>
                </div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                  {sc.title}
                </h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {sc.symptoms}
                </p>
              </div>

              <button 
                className={`btn ${isActive ? 'btn-danger' : 'btn-primary'}`}
                disabled={isTriggering || isActive}
                onClick={() => onTrigger(sc.id)}
                style={{ width: '100%', justifyContent: 'center', marginTop: '6px', fontSize: '0.85rem' }}
              >
                {isActive ? (
                  <>
                    <ShieldAlert size={16} />
                    Outage Active
                  </>
                ) : (
                  <>
                    <Play size={14} />
                    Trigger Scenario
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
