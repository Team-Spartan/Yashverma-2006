import React, { useState } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { defaultLineOptions } from '../../utils/chartConfigs';

export default function ContaminationChart({ trends = [] }) {
  const [selectedParams, setSelectedParams] = useState({
    ph: true,
    turbidity: true,
    dissolvedOxygen: false,
    tds: false,
    nitrates: false,
    fluoride: false
  });

  const parameterConfigs = {
    ph: {
      name: 'pH Level',
      label: 'pH Level (Safe Range 6.5 - 8.5)',
      dataKey: (item) => item.parameters?.ph || 7,
      borderColor: '#4cc9f0',
      backgroundColor: 'rgba(76, 201, 240, 0.15)'
    },
    turbidity: {
      name: 'Turbidity (NTU)',
      label: 'Turbidity (NTU)',
      dataKey: (item) => item.parameters?.turbidity || 1,
      borderColor: '#f59e0b',
      backgroundColor: 'rgba(245, 158, 11, 0.15)'
    },
    dissolvedOxygen: {
      name: 'Dissolved Oxygen',
      label: 'Dissolved Oxygen (mg/L)',
      dataKey: (item) => item.parameters?.dissolvedOxygen || 5,
      borderColor: '#34d399',
      backgroundColor: 'rgba(52, 211, 153, 0.15)'
    },
    tds: {
      name: 'TDS (mg/L)',
      label: 'TDS (mg/L)',
      dataKey: (item) => item.parameters?.tds || 250,
      borderColor: '#a855f7',
      backgroundColor: 'rgba(168, 85, 247, 0.15)'
    },
    nitrates: {
      name: 'Nitrates',
      label: 'Nitrates (mg/L)',
      dataKey: (item) => item.parameters?.nitrates || 0,
      borderColor: '#ec4899',
      backgroundColor: 'rgba(236, 72, 153, 0.15)'
    },
    fluoride: {
      name: 'Fluoride',
      label: 'Fluoride (mg/L)',
      dataKey: (item) => item.parameters?.fluoride || 0,
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.15)'
    }
  };

  const handleCheckboxChange = (param) => {
    setSelectedParams((prev) => {
      const activeCount = Object.values(prev).filter(Boolean).length;
      // At least one parameter must always be selected
      if (prev[param] && activeCount === 1) {
        return prev;
      }
      return {
        ...prev,
        [param]: !prev[param]
      };
    });
  };

  const labels = trends.map((item) => new Date(item.testDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }));
  
  const activeDatasets = Object.keys(selectedParams)
    .filter((key) => selectedParams[key])
    .map((key) => {
      const config = parameterConfigs[key];
      return {
        label: config.label,
        data: trends.map(config.dataKey),
        borderColor: config.borderColor,
        backgroundColor: config.backgroundColor,
        fill: true,
        tension: 0.4
      };
    });

  const chartData = {
    labels,
    datasets: activeDatasets
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
      
      {/* Parameter selection panel */}
      <div className="glass-card" style={{ gridColumn: '1 / -1', padding: '1.25rem' }}>
        <h4 style={{ marginBottom: '0.75rem', fontSize: '1rem', fontWeight: 600 }}>Select Parameters to Display on Trend Chart:</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
          {Object.keys(parameterConfigs).map((key) => {
            const config = parameterConfigs[key];
            const isSelected = selectedParams[key];
            const isOnlyOneSelected = Object.values(selectedParams).filter(Boolean).length === 1;

            return (
              <label 
                key={key} 
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  cursor: isSelected && isOnlyOneSelected ? 'not-allowed' : 'pointer',
                  userSelect: 'none',
                  fontSize: '0.9rem',
                  color: isSelected ? 'var(--text-main)' : 'var(--text-muted)',
                  fontWeight: isSelected ? 600 : 400
                }}
              >
                <input
                  type="checkbox"
                  id={`param-check-${key}`}
                  checked={isSelected}
                  onChange={() => handleCheckboxChange(key)}
                  disabled={isSelected && isOnlyOneSelected}
                  style={{
                    accentColor: config.borderColor,
                    width: '16px',
                    height: '16px',
                    cursor: isSelected && isOnlyOneSelected ? 'not-allowed' : 'pointer'
                  }}
                />
                {config.name}
              </label>
            );
          })}
        </div>
      </div>

      <div className="glass-card">
        <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Selected Parameters Trends Over Time</h3>
        <div style={{ height: 280 }}>
          <Line data={chartData} options={defaultLineOptions} />
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
