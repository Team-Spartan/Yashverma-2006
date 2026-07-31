import React from 'react';
import { Droplet, AlertTriangle, ShieldCheck, FileSpreadsheet } from 'lucide-react';

export default function WaterQualityStats({ summary }) {
  const cards = [
    { title: 'Total Water Sources', value: summary?.totalSources || 0, icon: Droplet, color: '#4cc9f0' },
    { title: 'Contaminated Sources', value: summary?.contaminatedSources || 0, icon: AlertTriangle, color: '#ef4444' },
    { title: 'Open Issues Reported', value: summary?.openIssues || 0, icon: ShieldCheck, color: '#f59e0b' },
    { title: 'Total Water Tests Logged', value: summary?.totalTestsLogged || 0, icon: FileSpreadsheet, color: '#10b981' }
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div key={idx} className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.8rem', borderRadius: '12px', background: `${card.color}20`, color: card.color }}>
              <Icon size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{card.title}</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: '0.2rem' }}>{card.value}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
