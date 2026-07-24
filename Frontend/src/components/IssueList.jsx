import React, { useState } from 'react';
import {
  AlertTriangle,
  MapPin,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Trash2,
  X,
  XCircle
} from 'lucide-react';
import { issueService } from '../services/issueService';
import './IssueList.css';

export default function IssueList({ issues, loading, onIssueDeleted }) {
  // State for deletion confirmation modal
  const [logToDelete, setLogToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Feedback notification banner state
  const [notification, setNotification] = useState(null);

  if (loading) {
    return (
      <div className="issues-loading">
        <div className="spinner" style={{ margin: '0 auto 0.5rem auto' }}></div>
        <p>Loading community water quality reports...</p>
      </div>
    );
  }

  // Handle Confirmed Log Deletion
  const handleConfirmDelete = async () => {
    if (!logToDelete) return;
    const targetId = logToDelete._id || logToDelete.id;
    const targetLocation = logToDelete.location;

    setIsDeleting(true);

    try {
      // 1. Call backend service endpoint to delete log
      await issueService.deleteIssue(targetId);

      // 2. Remove log from UI state via callback
      if (onIssueDeleted && typeof onIssueDeleted === 'function') {
        onIssueDeleted(targetId);
      }

      // 3. User feedback notification on successful deletion
      setNotification({
        type: 'success',
        title: 'Water Log Deleted',
        message: `Water quality test log for "${targetLocation}" has been successfully removed.`
      });

      // Reset modal state
      setLogToDelete(null);
    } catch (err) {
      console.error('Error deleting water quality log:', err);
      setNotification({
        type: 'error',
        title: 'Deletion Failed',
        message: err.message || 'Failed to delete water quality test log. Please try again.'
      });
    } finally {
      setIsDeleting(false);
    }
  };

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
        <h3 className="issues-list-title">Reported Water Quality Logs ({issues?.length || 0})</h3>
        <span className="live-status-pill">
          <span className="pulse-dot"></span>
          Live Feed
        </span>
      </div>

      {/* Global Toast / Feedback Banner Notification */}
      {notification && (
        <div className={`list-notification-banner ${notification.type}`} role="alert">
          <div className="notif-icon">
            {notification.type === 'success' ? (
              <CheckCircle2 size={20} color="#10b981" />
            ) : (
              <XCircle size={20} color="#ef4444" />
            )}
          </div>
          <div className="notif-content">
            <strong className="notif-title">{notification.title}</strong>
            <span className="notif-text">{notification.message}</span>
          </div>
          <button
            className="notif-close-btn"
            onClick={() => setNotification(null)}
            aria-label="Dismiss message"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Empty State */}
      {(!issues || issues.length === 0) ? (
        <div className="issues-empty">
          <CheckCircle2 size={36} color="#10b981" />
          <h3>No Contamination Issues Reported</h3>
          <p>All monitored water sources in the region are currently operating within optimal safety standards.</p>
        </div>
      ) : (
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
                <div className="issue-meta-info">
                  <div className="issue-reporter-info">
                    <User size={14} color="#94a3b8" />
                    <span>{iss.reporterName || 'Representative'}</span>
                  </div>
                  <div className="issue-time-info">
                    <Clock size={14} color="#94a3b8" />
                    <span>
                      {new Date(iss.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>

                {/* Delete button visible for each test log */}
                <button
                  type="button"
                  className="delete-card-btn"
                  onClick={() => setLogToDelete(iss)}
                  title="Delete this water quality test log"
                  aria-label={`Delete log for ${iss.location}`}
                >
                  <Trash2 size={14} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Deletion Confirmation Modal Overlay */}
      {logToDelete && (
        <div className="confirm-modal-overlay" role="dialog" aria-modal="true">
          <div className="confirm-modal-box">
            <div className="modal-header-danger">
              <div className="danger-icon-wrapper">
                <AlertTriangle size={24} color="#ef4444" />
              </div>
              <h4 className="modal-title">Confirm Log Removal</h4>
            </div>

            <div className="modal-body">
              <p>
                Are you sure you want to permanently delete the water quality report for{' '}
                <strong>"{logToDelete.location}"</strong>?
              </p>
              <div className="modal-log-summary">
                <div><strong>Category:</strong> {logToDelete.issueType || 'General Contamination'}</div>
                <div><strong>Severity:</strong> {logToDelete.severity}</div>
                <div><strong>Logged On:</strong> {new Date(logToDelete.createdAt).toLocaleString()}</div>
              </div>
              <p className="warning-text">This action cannot be undone and will remove the log from both the UI and backend database.</p>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setLogToDelete(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="confirm-delete-btn"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <span className="spinner" style={{ width: '14px', height: '14px' }}></span>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    <span>Confirm Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
