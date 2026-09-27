import React from 'react';
import { Server, Database, Shield, Zap, AlertTriangle, CheckCircle2, GitBranch } from 'lucide-react';

const serviceIcons = {
  'payment-gateway': Server,
  'auth-service': Shield,
  'redis-cluster': Zap,
  'database': Database
};

export default function TopologyGrid({ topology = [] }) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Server size={18} color="var(--accent-cyan)" />
          Live Microservice Telemetry Stream & Infrastructure Health
        </h2>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Real-time telemetry metric polling (2s)
        </span>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', 
        gap: '16px' 
      }}>
        {topology.map(service => {
          const isCritical = service.status === 'CRITICAL';
          const isDegraded = service.status === 'DEGRADED';
          const Icon = serviceIcons[service.id] || Server;

          let cardBorder = '1px solid var(--border-color)';
          let cardBg = 'var(--bg-card)';
          if (isCritical) {
            cardBorder = '1px solid rgba(244,63,94,0.6)';
            cardBg = 'rgba(244,63,94,0.06)';
          } else if (isDegraded) {
            cardBorder = '1px solid rgba(245,158,11,0.6)';
            cardBg = 'rgba(245,158,11,0.06)';
          }

          return (
            <div 
              key={service.id} 
              className="glass-panel" 
              style={{ 
                padding: '16px', 
                border: cardBorder,
                background: cardBg,
                boxShadow: isCritical ? '0 0 20px rgba(244,63,94,0.2)' : 'none'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ 
                    padding: '8px', 
                    borderRadius: '8px', 
                    background: isCritical ? 'rgba(244,63,94,0.15)' : 'rgba(0,240,255,0.1)',
                    color: isCritical ? 'var(--accent-rose)' : 'var(--accent-cyan)'
                  }}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{service.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                      <GitBranch size={12} color="var(--accent-cyan)" />
                      <span className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)' }}>
                        {service.deploymentVersion || 'v1.0.0'}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className={`status-indicator ${isCritical ? 'critical' : 'healthy'}`}></span>
                  <span style={{ 
                    fontSize: '0.75rem', 
                    fontWeight: 700, 
                    color: isCritical ? 'var(--accent-rose)' : 'var(--accent-emerald)' 
                  }}>
                    {service.status}
                  </span>
                </div>
              </div>

              {/* Metrics Grid */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '8px', 
                paddingTop: '10px', 
                borderTop: '1px solid rgba(255,255,255,0.05)',
                fontSize: '0.8rem'
              }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>CPU Utilization:</span>
                  <div className="font-mono" style={{ fontWeight: 600, color: service.cpuUsage > 85 ? 'var(--accent-rose)' : 'var(--text-main)' }}>
                    {service.cpuUsage}%
                  </div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Memory (RSS):</span>
                  <div className="font-mono" style={{ fontWeight: 600, color: service.memoryUsage > 85 ? 'var(--accent-rose)' : 'var(--text-main)' }}>
                    {service.memoryUsage}%
                  </div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Error Rate:</span>
                  <div className="font-mono" style={{ fontWeight: 600, color: service.errorRate > 5 ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>
                    {service.errorRate}%
                  </div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>P99 Latency:</span>
                  <div className="font-mono" style={{ fontWeight: 600, color: service.latencyMs > 1000 ? 'var(--accent-rose)' : 'var(--text-main)' }}>
                    {service.latencyMs}ms
                  </div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>DB Connections:</span>
                  <div className="font-mono" style={{ fontWeight: 600, color: service.dbConnections === '100/100' ? 'var(--accent-rose)' : 'var(--text-main)' }}>
                    {service.dbConnections || '18/100'}
                  </div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Request Volume:</span>
                  <div className="font-mono" style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                    {service.requestCount || 1200} req/s
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
