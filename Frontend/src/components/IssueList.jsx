import React from 'react';
import { AlertTriangle, MapPin, Clock, User, CheckCircle2, AlertCircle, ShieldAlert } from 'lucide-react';
import './IssueList.css';

export default function IssueList({ issues, loading }) {
  if (loading) {
    return (
      <div className="issues-loading">
        <div className="spinner" style={{ margin: '0 auto 0.5rem auto' }}></div>
        <p>Loading community water quality reports...</p>
      </div>
    );
  }

  if (!issues || issues.length === 0) {
    return (
      <div className="issues-empty">
        <CheckCircle2 size={36} color="#10b981" />
        <h3>No Contamination Issues Reported</h3>
        <p>All monitored water sources in the region are currently operating within optimal safety standards.</p>
      </div>
    );
  }

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'Critical':
        return (
          <span className="issue-severity-badge critical">
            <ShieldAlert size={13} />
            Critical
          </span>
        );
      case 'High':
        return (
          <span className="issue-severity-badge high">
            <AlertTriangle size={13} />
            High
          </span>
        );
      case 'Medium':
        return (
          <span className="issue-severity-badge medium">
            <AlertCircle size={13} />
            Medium
          </span>
        );
      case 'Low':
      default:
        return (
          <span className="issue-severity-badge low">
            <CheckCircle2 size={13} />
            Low
          </span>
        );
    }
  };

  return (
    <div className="issues-list-container">
      <div className="issues-list-header">
        <h3 className="issues-list-title">Reported Water Quality Logs ({issues.length})</h3>
        <span className="live-status-pill">
          <span className="pulse-dot"></span>
          Live Feed
        </span>
      </div>

      <div className="issues-grid">
        {issues.map((iss) => (
          <div key={iss._id || iss.id} className="issue-item-card">
            <div className="issue-card-top">
              <div className="issue-location-tag">
                <MapPin size={16} color="#38bdf8" />
                <span>{iss.location}</span>
              </div>
              {getSeverityBadge(iss.severity)}
            </div>

            <div className="issue-category-tag">
              <span>Type: {iss.issueType || 'General Contamination'}</span>
            </div>

            <p className="issue-description">{iss.description}</p>

            <div className="issue-card-footer">
              <div className="issue-reporter-info">
                <User size={14} color="#94a3b8" />
                <span>{iss.reporterName || 'Representative'}</span>
              </div>
              <div className="issue-time-info">
                <Clock size={14} color="#94a3b8" />
                <span>{new Date(iss.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
