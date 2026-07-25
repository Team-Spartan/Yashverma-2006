import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Droplets,
  Activity,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  RefreshCw,
  Info,
  Wind,
  Sliders,
  Thermometer,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Filter
} from 'lucide-react';
import TimeRangeSelector from './TimeRangeSelector';
import { WATER_PARAMETERS, waterQualityService } from '../services/waterQualityService';
import './StatsWidget.css';

export default function StatsWidget({ issues = [], onRefresh }) {
  // Time Range States
  const [timeRange, setTimeRange] = useState('7d');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Selected Water Quality Parameter State
  const [selectedParamId, setSelectedParamId] = useState('ph');

  // Icon mapper helper
  const getParamIcon = (paramId) => {
    switch (paramId) {
      case 'ph':
        return <Activity size={18} />;
      case 'turbidity':
        return <Droplets size={18} />;
      case 'do':
        return <Wind size={18} />;
      case 'tds':
        return <Sliders size={18} />;
      case 'chlorine':
        return <ShieldCheck size={18} />;
      case 'nitrate':
        return <AlertTriangle size={18} />;
      case 'temperature':
        return <Thermometer size={18} />;
      default:
        return <Activity size={18} />;
    }
  };

  // Handle custom date inputs
  const handleCustomDateChange = (type, value) => {
    if (type === 'start') setCustomStartDate(value);
    if (type === 'end') setCustomEndDate(value);
  };

  // 1. Get filtered telemetry readings for selected time range
  const allReadings = useMemo(() => waterQualityService.getReadings(), []);
  const filteredReadings = useMemo(() => {
    return waterQualityService.filterReadingsByRange(
      allReadings,
      timeRange,
      customStartDate,
      customEndDate
    );
  }, [allReadings, timeRange, customStartDate, customEndDate]);

  // 2. Compute Summary Statistics (Avg, Min, Max) for selected parameter & range
  const paramStats = useMemo(() => {
    return waterQualityService.calculateStats(filteredReadings, selectedParamId);
  }, [filteredReadings, selectedParamId]);

  // Compute dynamic positions for the Min - Avg - Max distribution gauge
  const gaugePositions = useMemo(() => {
    const { min, max, avg, count } = paramStats;
    if (!count || min === max) {
      return { minPos: 15, avgPos: 50, maxPos: 85 };
    }
    const minPos = 12;
    const maxPos = 88;
    const range = max - min;
    const rawAvgPos = Math.round(minPos + ((avg - min) / range) * (maxPos - minPos));
    const avgPos = Math.min(84, Math.max(16, rawAvgPos));
    return { minPos, avgPos, maxPos };
  }, [paramStats]);

  // 3. Filter Reported Issues by Time Range for secondary issue metrics
  const filteredIssues = useMemo(() => {
    if (!issues || issues.length === 0) return [];
    const now = Date.now();

    if (timeRange === '24h') {
      const boundary = now - 24 * 60 * 60 * 1000;
      return issues.filter((i) => new Date(i.createdAt).getTime() >= boundary);
    }

    if (timeRange === '7d') {
      const boundary = now - 7 * 24 * 60 * 60 * 1000;
      return issues.filter((i) => new Date(i.createdAt).getTime() >= boundary);
    }

    if (timeRange === '30d') {
      const boundary = now - 30 * 24 * 60 * 60 * 1000;
      return issues.filter((i) => new Date(i.createdAt).getTime() >= boundary);
    }

    if (timeRange === '90d') {
      const boundary = now - 90 * 24 * 60 * 60 * 1000;
      return issues.filter((i) => new Date(i.createdAt).getTime() >= boundary);
    }

    if (timeRange === 'custom') {
      let result = [...issues];
      if (customStartDate) {
        const startTimestamp = new Date(customStartDate).getTime();
        result = result.filter((i) => new Date(i.createdAt).getTime() >= startTimestamp);
      }
      if (customEndDate) {
        const endTimestamp = new Date(customEndDate).setHours(23, 59, 59, 999);
        result = result.filter((i) => new Date(i.createdAt).getTime() <= endTimestamp);
      }
      return result;
    }

    return issues;
  }, [issues, timeRange, customStartDate, customEndDate]);

  // Secondary issue metric totals
  const totalIssueCount = filteredIssues.length;
  const criticalCount = filteredIssues.filter((i) => i.severity === 'Critical').length;
  const highCount = filteredIssues.filter((i) => i.severity === 'High').length;
  const resolvedCount = filteredIssues.filter((i) => i.status === 'Resolved').length;
  const resolutionRate = totalIssueCount > 0 ? Math.round((resolvedCount / totalIssueCount) * 100) : 100;

  const handleRefreshClick = () => {
    setIsRefreshing(true);
    if (onRefresh && typeof onRefresh === 'function') {
      onRefresh();
    }
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const selectedParamDef = paramStats.paramDef;

  return (
    <div className="stats-widget-container">
      {/* Header & Controls */}
      <div className="stats-widget-header">
        <div className="widget-title-group">
          <div className="widget-icon">
            <BarChart3 size={22} color="#38bdf8" />
          </div>
          <div>
            <h3 className="widget-title">Water Quality Summary Statistics</h3>
            <p className="widget-subtitle">
              Average, Minimum, and Maximum values calculated dynamically across selected time ranges
            </p>
          </div>
        </div>

        <div className="widget-controls">
          <TimeRangeSelector
            selectedRange={timeRange}
            onRangeChange={setTimeRange}
            customStartDate={customStartDate}
            customEndDate={customEndDate}
            onCustomDateChange={handleCustomDateChange}
          />

          <button
            className="refresh-widget-btn"
            onClick={handleRefreshClick}
            title="Refresh summary statistics"
            disabled={isRefreshing}
          >
            <RefreshCw size={14} className={isRefreshing ? 'spinning' : ''} />
          </button>
        </div>
      </div>

      {/* Time Range Active Summary Banner */}
      <div className="range-summary-banner">
        <Info size={14} color="#38bdf8" />
        <span>
          Filter Active: <strong>{timeRange.toUpperCase()}</strong> ({paramStats.count} telemetry samples analyzed). Statistics dynamically update when changing parameter or range.
        </span>
      </div>

      {/* Water Parameter Selector Navigation Tabs */}
      <div className="parameter-selector-section">
        <div className="parameter-selector-label">
          <Filter size={15} color="#38bdf8" />
          <span>Select Water Parameter:</span>
        </div>
        <div className="parameter-tabs" role="tablist" aria-label="Water quality parameters">
          {WATER_PARAMETERS.map((param) => {
            const isSelected = selectedParamId === param.id;
            return (
              <button
                key={param.id}
                role="tab"
                aria-selected={isSelected}
                className={`param-tab ${isSelected ? 'active' : ''}`}
                onClick={() => setSelectedParamId(param.id)}
              >
                <span className="param-tab-icon">{getParamIcon(param.id)}</span>
                <span className="param-tab-name">{param.name}</span>
                <span className="param-tab-unit">({param.unit})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Primary Key Statistics Grid for Selected Parameter (Avg, Min, Max) */}
      <div className="parameter-stats-headline">
        <div className="headline-info">
          <h4 className="headline-title">
            Key Statistics for <span className="highlight-param">{selectedParamDef.name}</span>
          </h4>
          <span className="headline-category">{selectedParamDef.category} • Standard Safe Limit: {selectedParamDef.idealRange}</span>
        </div>
        <div className={`status-badge-pill ${paramStats.statusClass}`}>
          <ShieldCheck size={14} />
          <span>{paramStats.status}</span>
        </div>
      </div>

      <div className="summary-cards-grid">
        {/* Card 1: AVERAGE VALUE */}
        <div className="summary-card stat-card avg-card">
          <div className="card-top">
            <div className="card-icon-wrapper avg-icon">
              <Activity size={22} />
            </div>
            <span className="card-badge info">
              <Sparkles size={12} /> Key Metric
            </span>
          </div>
          <div className="card-body">
            <span className="card-label">Average Value ({selectedParamDef.unit})</span>
            <div className="card-main-val">
              <span className="val-number">{paramStats.avg}</span>
              <span className="val-unit">{selectedParamDef.unit}</span>
            </div>
            <div className="progress-bar-bg">
              <div
                className="progress-bar-fill avg-fill"
                style={{ width: `${Math.min(100, (paramStats.avg / (selectedParamDef.maxSafe || 10)) * 100)}%` }}
              ></div>
            </div>
            <span className="card-subtext">Mean calculated over {paramStats.count} sample readings</span>
          </div>
        </div>

        {/* Card 2: MINIMUM VALUE (MIN) */}
        <div className="summary-card stat-card min-card">
          <div className="card-top">
            <div className="card-icon-wrapper min-icon">
              <ArrowDownRight size={22} />
            </div>
            <span className="card-badge success">
              Lowest Limit
            </span>
          </div>
          <div className="card-body">
            <span className="card-label">Minimum Recorded (Min)</span>
            <div className="card-main-val">
              <span className="val-number">{paramStats.min}</span>
              <span className="val-unit">{selectedParamDef.unit}</span>
            </div>
            <div className="progress-bar-bg">
              <div
                className="progress-bar-fill min-fill"
                style={{ width: `${Math.min(100, (paramStats.min / (selectedParamDef.maxSafe || 10)) * 100)}%` }}
              ></div>
            </div>
            <span className="card-subtext">Lowest value logged in {timeRange.toUpperCase()} range</span>
          </div>
        </div>

        {/* Card 3: MAXIMUM VALUE (MAX) */}
        <div className="summary-card stat-card max-card">
          <div className="card-top">
            <div className="card-icon-wrapper max-icon">
              <ArrowUpRight size={22} />
            </div>
            <span className="card-badge warning">
              Highest Limit
            </span>
          </div>
          <div className="card-body">
            <span className="card-label">Maximum Recorded (Max)</span>
            <div className="card-main-val">
              <span className="val-number">{paramStats.max}</span>
              <span className="val-unit">{selectedParamDef.unit}</span>
            </div>
            <div className="progress-bar-bg">
              <div
                className="progress-bar-fill max-fill"
                style={{ width: `${Math.min(100, (paramStats.max / (selectedParamDef.maxSafe || 10)) * 100)}%` }}
              ></div>
            </div>
            <span className="card-subtext">Peak value logged in {timeRange.toUpperCase()} range</span>
          </div>
        </div>

        {/* Card 4: COMPLIANCE RATE & SAFE RANGE */}
        <div className="summary-card stat-card compliance-card">
          <div className="card-top">
            <div className="card-icon-wrapper compliance-icon">
              <CheckCircle2 size={22} />
            </div>
            <span className="card-badge success">
              <TrendingUp size={12} /> {paramStats.inRangePercentage}% Safe
            </span>
          </div>
          <div className="card-body">
            <span className="card-label">Compliance Benchmark</span>
            <div className="card-main-val">
              <span className="val-number">{paramStats.inRangePercentage}%</span>
              <span className="val-unit">In Standard Range</span>
            </div>
            <div className="progress-bar-bg">
              <div
                className="progress-bar-fill compliance-fill"
                style={{ width: `${paramStats.inRangePercentage}%` }}
              ></div>
            </div>
            <span className="card-subtext">Ideal Target: {selectedParamDef.idealRange}</span>
          </div>
        </div>
      </div>

      {/* Min - Avg - Max Range Visualizer Gauge Bar */}
      <div className="range-gauge-container">
        <div className="range-gauge-header">
          <span>Min – Avg – Max Distribution Gauge ({selectedParamDef.name})</span>
          <span className="range-gauge-subtitle">Safe Range Boundary: {selectedParamDef.minSafe} – {selectedParamDef.maxSafe} {selectedParamDef.unit}</span>
        </div>
        <div className="range-gauge-bar-track">
          <div className="gauge-marker min" style={{ left: `${gaugePositions.minPos}%` }}>
            <span className="marker-pin"></span>
            <span className="marker-label">Min: {paramStats.min}</span>
          </div>
          <div className="gauge-marker avg" style={{ left: `${gaugePositions.avgPos}%` }}>
            <span className="marker-pin"></span>
            <span className="marker-label">Avg: {paramStats.avg}</span>
          </div>
          <div className="gauge-marker max" style={{ left: `${gaugePositions.maxPos}%` }}>
            <span className="marker-pin"></span>
            <span className="marker-label">Max: {paramStats.max}</span>
          </div>
        </div>
      </div>

      {/* Secondary Issue Reports Overview */}
      <div className="issue-overview-section">
        <div className="overview-header">
          <div className="header-title-flex">
            <AlertTriangle size={18} color="#f59e0b" />
            <h5 className="overview-title">Community Contamination Incident Summary</h5>
          </div>
          <span className="overview-count-pill">{totalIssueCount} Incident Reports</span>
        </div>

        <div className="secondary-metrics-grid">
          <div className="sec-metric-item">
            <span className="sec-label">Total Reports</span>
            <span className="sec-val">{totalIssueCount}</span>
          </div>
          <div className="sec-metric-item">
            <span className="sec-label">Critical / Severe</span>
            <span className="sec-val critical">{criticalCount + highCount}</span>
          </div>
          <div className="sec-metric-item">
            <span className="sec-label">Resolution Rate</span>
            <span className="sec-val success">{resolutionRate}%</span>
          </div>
          <div className="sec-metric-item">
            <span className="sec-label">Active Monitoring</span>
            <span className="sec-val info">Online</span>
          </div>
        </div>
      </div>
    </div>
  );
}
