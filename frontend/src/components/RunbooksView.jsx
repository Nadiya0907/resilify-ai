import React from 'react';
import { BookOpen, ShieldCheck, FileText, CheckCircle2, ChevronRight } from 'lucide-react';

export default function RunbooksView({ runbooks = [] }) {
  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <BookOpen size={22} color="var(--accent-cyan)" />
          Structured SRE Operational Runbooks Repository
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          Pre-approved, safe sandboxed remediation runbooks associated with historical incident patterns.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
        {runbooks.map(rb => (
          <div 
            key={rb.id} 
            style={{ 
              background: 'rgba(255,255,255,0.02)', 
              border: '1px solid var(--border-color)', 
              borderRadius: '8px', 
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              justify: 'space-between',
              gap: '12px'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="font-mono" style={{ fontSize: '0.8rem', background: 'rgba(0,240,255,0.12)', color: 'var(--accent-cyan)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                  {rb.id}
                </span>
                <span style={{ fontSize: '0.72rem', background: 'rgba(16,185,129,0.15)', color: 'var(--accent-emerald)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                  {rb.safetyLevel}
                </span>
              </div>

              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>
                {rb.title}
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.4', marginBottom: '12px' }}>
                {rb.description}
              </p>

              <div style={{ marginBottom: '10px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                  Execution Steps:
                </span>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {rb.steps.map((step, idx) => (
                    <li key={idx} style={{ fontSize: '0.78rem', color: 'var(--text-main)', background: 'rgba(0,0,0,0.3)', padding: '6px 10px', borderRadius: '4px' }}>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div style={{ background: 'rgba(16,185,129,0.08)', padding: '8px 12px', borderRadius: '6px', fontSize: '0.78rem', color: 'var(--accent-emerald)' }}>
              <strong>Expected Result:</strong> {rb.expectedResult}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
