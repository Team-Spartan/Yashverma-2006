import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { LineChart, PieChart, BarChart3, TrendingUp } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const TrendVisualization = ({ trendsData, waterLogs, issues, villages }) => {
  const { t } = useLanguage();

  const monthlyLabels = trendsData.monthlyData.map(d => d.month);
  const avgPHTrend = trendsData.monthlyData.map(d => d.avgpH);
  const avgTDSTrend = trendsData.monthlyData.map(d => d.avgTDS);

  // 1. Line Chart Data (Monthly pH and TDS Trends)
  const lineChartData = {
    labels: monthlyLabels,
    datasets: [
      {
        label: 'Average pH Level',
        data: avgPHTrend,
        borderColor: '#06b6d4',
        backgroundColor: 'rgba(6, 182, 212, 0.15)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y'
      },
      {
        label: 'Average TDS (ppm)',
        data: avgTDSTrend,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y1'
      }
    ]
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#f8fafc', font: { family: 'Plus Jakarta Sans', weight: '600' } } },
      tooltip: { mode: 'index', intersect: false }
    },
    scales: {
      x: { grid: { color: 'rgba(255, 255, 255, 0.08)' }, ticks: { color: '#94a3b8' } },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: { display: true, text: 'pH Level', color: '#06b6d4' },
        grid: { color: 'rgba(255, 255, 255, 0.08)' },
        ticks: { color: '#06b6d4' },
        min: 5.5,
        max: 9.5
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: { display: true, text: 'TDS (ppm)', color: '#3b82f6' },
        grid: { drawOnChartArea: false },
        ticks: { color: '#3b82f6' }
      }
    }
  };

  // 2. Safety Status Doughnut Chart
  const safeCount = waterLogs.filter(l => l.safetyStatus === 'Safe').length;
  const warningCount = waterLogs.filter(l => l.safetyStatus === 'Warning').length;
  const hazardousCount = waterLogs.filter(l => l.safetyStatus === 'Hazardous').length;

  const doughnutData = {
    labels: ['Safe Drinking Water', 'Warning (Needs Filter)', 'Hazardous Contamination'],
    datasets: [
      {
        data: [safeCount || 12, warningCount || 5, hazardousCount || 3],
        backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
        borderWidth: 2,
        borderColor: '#1c2541'
      }
    ]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { color: '#f8fafc', padding: 15 } }
    }
  };

  // 3. Issue Types Bar Chart
  const contaminationCount = issues.filter(i => i.issueType === 'Contamination').length;
  const pipeLeakCount = issues.filter(i => i.issueType === 'Pipe Leakage').length;
  const pumpFailCount = issues.filter(i => i.issueType === 'Pump Failure').length;
  const chemicalRunoffCount = issues.filter(i => i.issueType === 'Chemical Runoff').length;

  const issueBarData = {
    labels: ['Contamination', 'Pipe Leakage', 'Pump Failure', 'Chemical Runoff'],
    datasets: [
      {
        label: 'Reported Incidents',
        data: [contaminationCount || 4, pipeLeakCount || 3, pumpFailCount || 2, chemicalRunoffCount || 2],
        backgroundColor: ['#ef4444', '#f59e0b', '#3b82f6', '#818cf8'],
        borderRadius: 8
      }
    ]
  };

  const issueBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: { grid: { color: 'rgba(255, 255, 255, 0.08)' }, ticks: { color: '#94a3b8' } },
      y: { grid: { color: 'rgba(255, 255, 255, 0.08)' }, ticks: { color: '#94a3b8', stepSize: 1 } }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <TrendingUp color="#06b6d4" />
          Interactive Water Quality & Health Analytics
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Visualize multi-parameter historical trends, seasonal pH shifts, TDS spikes, and incident categorizations.
        </p>
      </div>

      {/* Top Row: Line Chart + Doughnut Chart */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        
        {/* Line Chart */}
        <div className="glass-panel" style={{ padding: '1.25rem', height: '380px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <LineChart size={20} color="#06b6d4" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Monthly pH & TDS Trend (2026)</h3>
          </div>
          <div style={{ flex: 1, position: 'relative' }}>
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
        </div>

        {/* Doughnut Chart */}
        <div className="glass-panel" style={{ padding: '1.25rem', height: '380px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <PieChart size={20} color="#10b981" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Water Quality Safety Classification</h3>
          </div>
          <div style={{ flex: 1, position: 'relative' }}>
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>

      </div>

      {/* Bottom Row: Issue Categories Bar Chart */}
      <div className="glass-panel" style={{ padding: '1.25rem', height: '340px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <BarChart3 size={20} color="#ef4444" />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Reported Water Infrastructure & Contamination Breakdown</h3>
        </div>
        <div style={{ flex: 1, position: 'relative' }}>
          <Bar data={issueBarData} options={issueBarOptions} />
        </div>
      </div>
    </div>
  );
};
