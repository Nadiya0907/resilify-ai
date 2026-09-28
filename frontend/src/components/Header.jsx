import React from 'react';
import { Activity, Brain, Database, ShieldAlert, Cpu, Sparkles, PlayCircle, BookOpen, Layers, GitCompare } from 'lucide-react';

export default function Header({ statusInfo, activeTab, setActiveTab }) {
  const modeInfo = statusInfo?.modeInfo || {};
 const isCloud = true;
  const memoryCount = statusInfo?.stats?.totalMemories || 5;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Cpu },
    { id: 'incidents', label: 'Incidents Console', icon: ShieldAlert },
    { id: 'replay', label: 'Incident Replay', icon: PlayCircle },
    { id: 'memory', label: 'Memory Explorer', icon: Database },
    { id: 'runbooks', label: 'Runbooks', icon: BookOpen },
    { id: 'compare', label: 'Stateless vs Resilify', icon: Sparkles }
  ];

  return (
    <header className="glass-panel" style={{ padding: '16px 24px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Logo & Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ 
            width: '44px', 
            height: '44px', 
            borderRadius: '10px', 
            background: 'linear-gradient(135deg, rgba(0,240,255,0.2) 0%, rgba(168,85,247,0.2) 100%)',
            border: '1px solid rgba(0,240,255,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 18px rgba(0,240,255,0.25)'
          }}>
            <Brain size={26} className="glow-cyan" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.45rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
                Resilify<span className="glow-cyan">.AI</span>
              </h1>
              <span style={{ 
                fontSize: '0.7rem', 
                background: 'rgba(0,240,255,0.12)', 
                color: 'var(--accent-cyan)', 
                border: '1px solid rgba(0,240,255,0.3)',
                padding: '2px 8px', 
                borderRadius: '12px',
                fontWeight: 700,
                textTransform: 'uppercase'
              }}>
                Hindsight Memory Engine
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Autonomous SRE Incident Investigation & Remediation Platform
            </p>
          </div>
        </div>

        {/* Hindsight Status Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          
          {/* Active Bank Indicator */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            background: 'rgba(255,255,255,0.03)', 
            padding: '8px 14px', 
            borderRadius: '8px',
            border: '1px solid var(--border-color)'
          }}>
            <Database size={16} color="var(--accent-cyan)" />
            <div style={{ fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Bank: </span>
              <span className="font-mono" style={{ fontWeight: 600, color: 'var(--text-main)' }}>sre-incidents-bank</span>
            </div>
            <span style={{ 
              background: 'rgba(16,185,129,0.15)', 
              color: 'var(--accent-emerald)', 
              fontSize: '0.75rem', 
              padding: '2px 8px', 
              borderRadius: '6px',
              fontWeight: 700
            }}>
              {memoryCount} Memories
            </span>
          </div>

          {/* Hindsight Mode Badge */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            background: isCloud ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', 
            padding: '8px 14px', 
            borderRadius: '8px',
            border: isCloud ? '1px solid rgba(16,185,129,0.4)' : '1px solid rgba(245,158,11,0.4)'
          }}>
            <Activity size={16} color={isCloud ? 'var(--accent-emerald)' : 'var(--accent-amber)'} />
            <div style={{ fontSize: '0.8rem' }}>
              <span style={{ color: isCloud ? 'var(--accent-emerald)' : 'var(--accent-amber)', fontWeight: 700 }}>
                {isCloud ? 'Vectorize Hindsight Cloud' : 'Local Hindsight Memory Engine'}
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* Navigation Tabs Bar */}
      <nav style={{ 
        display: 'flex', 
        gap: '8px', 
        marginTop: '16px', 
        paddingTop: '12px', 
        borderTop: '1px solid var(--border-color)',
        overflowX: 'auto'
      }}>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`btn ${isActive ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab(item.id)}
              style={{ fontSize: '0.85rem', padding: '8px 14px', whiteSpace: 'nowrap' }}
            >
              <Icon size={15} />
              {item.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
