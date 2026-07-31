import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, Filler
);

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const PARAMETER_CONFIG = {
  ph: {
    key: 'ph',
    label: 'pH Level',
    unit: '',
    color: '#0077b6',
    backgroundColor: 'rgba(0,119,182,0.08)',
    min: 0,
    max: 14,
    yAxisID: 'y',
  },
  tds: {
    key: 'tds',
    label: 'TDS',
    unit: 'ppm',
    color: '#ae2012',
    backgroundColor: 'rgba(174,32,18,0.08)',
    min: 0,
    max: null,
    yAxisID: 'y1',
  },
  turbidity: {
    key: 'turbidity',
    label: 'Turbidity',
    unit: 'NTU',
    color: '#2d6a4f',
    backgroundColor: 'rgba(45,106,79,0.08)',
    min: 0,
    max: null,
    yAxisID: 'y2',
  },
  chlorine: {
    key: 'chlorine',
    label: 'Chlorine',
    unit: 'mg/L',
    color: '#7b2cbf',
    backgroundColor: 'rgba(123,44,191,0.08)',
    min: 0,
    max: null,
    yAxisID: 'y3',
  },
};

const WaterQualityChart = ({
  trends = [],
  parameters = ['ph', 'tds'],
  height = 350,
  showLegend = true,
  title,
  loading = false,
  error = '',
  emptyMessage = 'No trend data available',
}) => {
  const chartRef = useRef(null);

  const activeParams = parameters
    .filter((p) => PARAMETER_CONFIG[p])
    .map((p) => PARAMETER_CONFIG[p]);

  const labels = trends.map((t) => {
    if (t.year && t.month) {
      return `${MONTHS[t.month - 1]} ${t.year}`;
    }
    if (t._id?.month && t._id?.year) {
      return `${MONTHS[t._id.month - 1]} ${t._id.year}`;
    }
    return 'Unknown';
  });

  const getMetricValue = (item, metricKey) => {
    const mapping = {
      ph: 'avgPh',
      tds: 'avgTds',
      turbidity: 'avgTurbidity',
      chlorine: 'avgChlorine',
    };
    return item[mapping[metricKey]] ?? null;
  };

  const datasets = activeParams.map((param, idx) => {
    const data = trends.map((t) => {
      const val = getMetricValue(t, param.key);
      return val != null ? parseFloat(Number(val).toFixed(2)) : null;
    });

    return {
      label: `${param.label}${param.unit ? ` (${param.unit})` : ''}`,
      data,
      borderColor: param.color,
      backgroundColor: param.backgroundColor,
      fill: idx === 0,
      tension: 0.4,
      pointRadius: 3,
      pointHoverRadius: 6,
      pointBackgroundColor: param.color,
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      borderWidth: 2.5,
      spanGaps: false,
      yAxisID: activeParams.length <= 2 ? (idx === 0 ? 'y' : 'y1') : param.yAxisID,
    };
  });

  const chartData = { labels, datasets };

  const buildScales = () => {
    if (activeParams.length === 0) return {};

    if (activeParams.length === 1) {
      return {
        y: {
          beginAtZero: activeParams[0].key !== 'ph',
          min: activeParams[0].min,
          max: activeParams[0].max,
          title: { display: true, text: `${activeParams[0].label} (${activeParams[0].unit || 'value'})`, font: { size: 12, weight: '600' } },
          grid: { color: 'rgba(0,0,0,0.04)' },
        },
        x: {
          title: { display: true, text: 'Month', font: { size: 12, weight: '600' } },
          grid: { display: false },
        },
      };
    }

    if (activeParams.length === 2) {
      return {
        y: {
          beginAtZero: activeParams[0].key !== 'ph',
          min: activeParams[0].min,
          max: activeParams[0].max,
          position: 'left',
          title: { display: true, text: `${activeParams[0].label} (${activeParams[0].unit || 'value'})`, font: { size: 12, weight: '600' } },
          grid: { color: 'rgba(0,0,0,0.04)' },
        },
        y1: {
          beginAtZero: activeParams[1].key !== 'ph',
          min: activeParams[1].min,
          max: activeParams[1].max,
          position: 'right',
          title: { display: true, text: `${activeParams[1].label} (${activeParams[1].unit || 'value'})`, font: { size: 12, weight: '600' } },
          grid: { drawOnChartArea: false },
        },
        x: {
          title: { display: true, text: 'Month', font: { size: 12, weight: '600' } },
          grid: { display: false },
        },
      };
    }

    const scales = {
      x: {
        title: { display: true, text: 'Month', font: { size: 12, weight: '600' } },
        grid: { display: false },
      },
    };

    const yPositions = ['left', 'right', 'left', 'right'];
    activeParams.forEach((param, idx) => {
      const id = idx === 0 ? 'y' : `y${idx}`;
      scales[id] = {
        beginAtZero: param.key !== 'ph',
        min: param.min,
        max: param.max,
        position: yPositions[idx] || 'left',
        title: { display: true, text: `${param.label} (${param.unit || 'value'})`, font: { size: 12, weight: '600' } },
        grid: idx % 2 === 1 ? { drawOnChartArea: false } : { color: 'rgba(0,0,0,0.04)' },
      };
    });

    return scales;
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 600, easing: 'easeOutQuart' },
    plugins: {
      legend: {
        display: showLegend,
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 16,
          font: { size: 12 },
        },
      },
      title: {
        display: !!title,
        text: title || '',
        font: { size: 14, weight: '600' },
        padding: { bottom: 16 },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(26,26,46,0.95)',
        titleFont: { size: 13, weight: '600' },
        bodyFont: { size: 12 },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (ctx) => {
            const param = activeParams[ctx.datasetIndex];
            if (!param) return '';
            if (ctx.parsed.y == null) return `${ctx.dataset.label}: No data`;
            return `${ctx.dataset.label}: ${ctx.parsed.y}${param.unit ? ' ' + param.unit : ''}`;
          },
        },
      },
    },
    scales: buildScales(),
    interaction: { mode: 'nearest', axis: 'x', intersect: false },
  };

  if (loading) {
    return (
      <div className="wq-chart-wrapper" style={{ height }}>
        <div className="wq-chart-loading">
          <div className="spinner" />
          <span>Loading chart data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="wq-chart-wrapper" style={{ height }}>
        <div className="wq-chart-error">
          <span className="wq-chart-error-icon">&#9888;&#65039;</span>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (trends.length === 0 || activeParams.length === 0) {
    return (
      <div className="wq-chart-wrapper" style={{ height }}>
        <div className="wq-chart-empty">
          <span className="wq-chart-empty-icon">&#128202;</span>
          <p>{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="wq-chart-wrapper" style={{ height }}>
      <Line ref={chartRef} data={chartData} options={options} />
    </div>
  );
};

export { PARAMETER_CONFIG };
export default WaterQualityChart;
