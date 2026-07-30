import React from 'react';
import { Award, CheckCircle2, Code2, Layers, Cpu, Globe, Users, BookOpen } from 'lucide-react';

export const BrandView = () => {
  const teamMembers = [
    { name: "Yash", role: "Team Leader & Full-Stack Developer", stories: "5/5 Stories Completed", status: "Leader - All Stories Finished" },
    { name: "Ankit", role: "Frontend & Chart.js Specialist", stories: "5/5 Stories Completed", status: "Member - All Stories Finished" },
    { name: "Nitish", role: "Backend & API Architect", stories: "5/5 Stories Completed", status: "Member - All Stories Finished" },
    { name: "Rohit", role: "QA & System Design Engineer", stories: "5/5 Stories Completed", status: "Member - All Stories Finished" }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Title Header */}
      <div className="glass-panel" style={{
        padding: '1.5rem',
        background: 'linear-gradient(135deg, rgba(6,182,212,0.2), rgba(99,102,241,0.2))',
        borderColor: 'rgba(6,182,212,0.4)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#38bdf8', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
            <Award size={18} /> STCIP Cohort - 2 | Certificate in MERN Stack Development with AI-Assisted Coding
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '0.2rem' }}>
            JalDrishti (जलदृष्टि) - Brand & System Architecture
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Team G Final Internship Capstone Project for Rural Water Quality Monitoring & Rapid Contamination Triage.
          </p>
        </div>

        <div style={{ background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.4)', padding: '0.65rem 1.25rem', borderRadius: '10px', color: '#6ee7b7', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={20} /> 100% Stories Completed (20/20)
        </div>
      </div>

      {/* Team G Members Progress Grid */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Users color="#06b6d4" /> Team G Roster & Story Progress
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1rem' }}>
          {teamMembers.map((m, idx) => (
            <div
              key={idx}
              style={{
                background: 'rgba(15, 23, 42, 0.7)',
                padding: '1rem',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem'
              }}
            >
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: idx === 0 ? '#38bdf8' : 'var(--text-primary)' }}>
                {m.name} {idx === 0 && '👑'}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{m.role}</div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#10b981', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <CheckCircle2 size={15} /> {m.stories}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Architectural Specs & Features */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        
        {/* Core Stack */}
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers color="#3b82f6" /> Technology Stack
          </h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            <li>🔹 <strong>Frontend:</strong> React.js + Vite + Modern Glassmorphism CSS + Lucide Icons</li>
            <li>🔹 <strong>Visualization:</strong> Chart.js & React-Chartjs-2 (Line, Bar, Doughnut)</li>
            <li>🔹 <strong>Backend:</strong> Node.js + Express.js REST API + Dual In-Memory/Mongoose Fallback</li>
            <li>🔹 <strong>Authentication:</strong> JWT (JSON Web Tokens) + Role-Based Access Control (RBAC)</li>
            <li>🔹 <strong>Database:</strong> MongoDB / Mongoose with pre-seeded Indian village test data</li>
          </ul>
        </div>

        {/* BIS Standards */}
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen color="#10b981" /> BIS IS 10500 Compliance Standard
          </h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            <li>🧪 <strong>pH Range:</strong> Acceptable 6.5 - 8.5 (Triggers acidity/alkalinity alerts)</li>
            <li>🧪 <strong>TDS Limit:</strong> Safe &lt; 500 mg/L | Max Permissible 2000 mg/L</li>
            <li>🧪 <strong>Turbidity:</strong> Safe &lt; 1 NTU | Max Permissible 5 NTU</li>
            <li>🧪 <strong>Fluoride:</strong> Safe &lt; 1.0 mg/L | Risk of Fluorosis &gt; 1.5 mg/L</li>
            <li>🧪 <strong>Bacterial Load:</strong> 0 CFU/100ml (Cholera / E.Coli prevention threshold)</li>
          </ul>
        </div>

      </div>
    </div>
  );
};
