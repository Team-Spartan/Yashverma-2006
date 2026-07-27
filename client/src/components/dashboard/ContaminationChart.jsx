import React from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { defaultLineOptions } from '../../utils/chartConfigs';

export default function ContaminationChart({ trends = [] }) {
  const labels = trends.map((item) => new Date(item.testDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }));
  
  const phData = {
    labels,
    datasets: [
      {
        label: 'pH Level (Safe Range 6.5 - 8.5)',
        data: trends.map((item) => item.parameters?.ph || 7),
        borderColor: '#4cc9f0',
        backgroundColor: 'rgba(76, 201, 240, 0.15)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Turbidity (NTU)',
        data: trends.map((item) => item.parameters?.turbidity || 1),
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.15)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const wqiData = {
    labels,
    datasets: [
      {
        label: 'Water Quality Index (WQI)',
        data: trends.map((item) => item.calculatedWQI || 80),
        backgroundColor: trends.map((item) =>
          item.calculatedWQI >= 70 ? 'rgba(16, 185, 129, 0.7)' : item.calculatedWQI >= 50 ? 'rgba(245, 158, 11, 0.7)' : 'rgba(239, 68, 68, 0.7)'
        ),
        borderRadius: 6
      }
    ]
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
      <div className="glass-card">
        <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>pH & Turbidity Trends Over Time</h3>
        <div style={{ height: 280 }}>
          <Line data={phData} options={defaultLineOptions} />
        </div>
      </div>

      <div className="glass-card">
        <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>WQI Score Distribution</h3>
        <div style={{ height: 280 }}>
          <Bar data={wqiData} options={defaultLineOptions} />
        </div>
      </div>
    </div>
  );
}
