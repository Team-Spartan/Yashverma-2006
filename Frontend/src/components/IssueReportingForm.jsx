import React, { useState } from 'react';
import { useAuth } from '../context/useAuth';
import { issueService } from '../services/issueService';
import {
  AlertTriangle,
  MapPin,
  FileText,
  Send,
  CheckCircle2,
  XCircle,
  X,
  Droplet,
  Info,
  AlertCircle,
  RotateCcw
} from 'lucide-react';
import './IssueReportingForm.css';

const SEVERITY_LEVELS = [
  {
    id: 'Low',
    label: 'Low',
    desc: 'Minor issue (e.g., slight discoloration, routine maintenance)',
    badgeClass: 'severity-low',
    color: '#10b981'
  },
  {
    id: 'Medium',
    label: 'Medium',
    desc: 'Moderate issue (e.g., unusual taste, moderate turbidity)',
    badgeClass: 'severity-medium',
    color: '#f59e0b'
  },
  {
    id: 'High',
    label: 'High',
    desc: 'Severe issue (e.g., foul odor, chemical contamination suspected)',
    badgeClass: 'severity-high',
    color: '#ef4444'
  },
  {
    id: 'Critical',
    label: 'Critical',
    desc: 'Emergency (e.g., immediate health hazard, toxic contamination)',
    badgeClass: 'severity-critical',
    color: '#dc2626'
  }
];

const ISSUE_TYPES = [
  'High Turbidity / Muddy Water',
  'Chemical Odor / Unusual Smell',
  'Foul Taste / Salinity',
  'Pipeline Leakage / Damage',
  'Bacterial / Sewage Contamination',
  'Other Water Quality Hazard'
];

export default function IssueReportingForm({ onIssueCreated }) {
  const { user } = useAuth();

  // Form State
  const [formData, setFormData] = useState({
    location: '',
    description: '',
    severity: 'Medium',
    issueType: ISSUE_TYPES[0]
  });

  // Validation state
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Global Notification state (Success & Error messages)
  const [notification, setNotification] = useState(null);

  // Field Validation Logic
  const validateField = (name, value) => {
    let errorMsg = '';

    if (name === 'location') {
      if (!value || !value.trim()) {
        errorMsg = 'Location is required. Please specify the village, well, or source location.';
      } else if (value.trim().length < 3) {
        errorMsg = 'Location must be at least 3 characters long.';
      }
    }

    if (name === 'description') {
      if (!value || !value.trim()) {
        errorMsg = 'Issue description is required. Please describe the problem.';
      } else if (value.trim().length < 10) {
        errorMsg = 'Issue description must be at least 10 characters long.';
      }
    }

    if (name === 'severity') {
      if (!value) {
        errorMsg = 'Please select a severity level for the issue.';
      }
    }

    return errorMsg;
  };

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Re-validate touched field
    if (touched[name]) {
      const errorMsg = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: errorMsg }));
    }
  };

  // Handle Blur Events
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const errorMsg = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
  };

  // Select Severity Option
  const handleSeveritySelect = (severityId) => {
    setFormData((prev) => ({ ...prev, severity: severityId }));
    setTouched((prev) => ({ ...prev, severity: true }));
    const errorMsg = validateField('severity', severityId);
    setErrors((prev) => ({ ...prev, severity: errorMsg }));
  };

  // Full Form Validation Check before submission
  const validateForm = () => {
    const newErrors = {};
    newErrors.location = validateField('location', formData.location);
    newErrors.description = validateField('description', formData.description);
    newErrors.severity = validateField('severity', formData.severity);

    setErrors(newErrors);
    setTouched({
      location: true,
      description: true,
      severity: true
    });

    // Form is valid if no non-empty error strings exist
    return !Object.values(newErrors).some((msg) => Boolean(msg));
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setNotification(null);

    // Validate required fields
    const isValid = validateForm();
    if (!isValid) {
      setNotification({
        type: 'error',
        title: 'Validation Failed',
        message: 'Please complete all required fields correctly before submitting.'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        location: formData.location.trim(),
        description: formData.description.trim(),
        severity: formData.severity,
        issueType: formData.issueType,
        reporterName: user?.name || 'Authenticated Representative',
        reporterEmail: user?.email || ''
      };

      // Send data to backend endpoint
      const response = await issueService.createIssue(payload);

      // Handle Success Response
      const createdIssue = response.issue || response;
      setNotification({
        type: 'success',
        title: 'Issue Reported Successfully!',
        message: `Water quality issue at "${formData.location}" has been logged into the system (ID: #${createdIssue._id || 'WQI-NEW'}).`
      });

      // Reset form fields after successful submission
      setFormData({
        location: '',
        description: '',
        severity: 'Medium',
        issueType: ISSUE_TYPES[0]
      });
      setErrors({});
      setTouched({});

      // Notify parent component if callback provided
      if (onIssueCreated && typeof onIssueCreated === 'function') {
        onIssueCreated(createdIssue);
      }
    } catch (err) {
      console.error('Submission Error:', err);
      // Handle Error Response & display error notification to user
      setNotification({
        type: 'error',
        title: 'Submission Error',
        message: err.message || 'Failed to send report to the server. Please check your connection and try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form inputs and clear validation errors
  const handleReset = () => {
    setFormData({
      location: '',
      description: '',
      severity: 'Medium',
      issueType: ISSUE_TYPES[0]
    });
    setErrors({});
    setTouched({});
    setNotification(null);
  };

  return (
    <div className="issue-form-card">
      <div className="issue-form-header">
        <div className="header-icon-wrapper">
          <AlertTriangle size={24} color="#f59e0b" />
        </div>
        <div>
          <h2 className="issue-form-title">Report Water Quality Issue</h2>
          <p className="issue-form-subtitle">
            Submit a water contamination, supply, or quality hazard report to alert local health authorities.
          </p>
        </div>
      </div>

      {/* Global Toast / Banner Notifications */}
      {notification && (
        <div
          className={`notification-banner ${notification.type}`}
          role="alert"
          aria-live="polite"
        >
          <div className="notification-icon">
            {notification.type === 'success' ? (
              <CheckCircle2 size={22} color="#10b981" />
            ) : (
              <XCircle size={22} color="#ef4444" />
            )}
          </div>
          <div className="notification-body">
            <h4 className="notification-title">{notification.title}</h4>
            <p className="notification-msg">{notification.message}</p>
          </div>
          <button
            className="notification-close-btn"
            onClick={() => setNotification(null)}
            aria-label="Close notification"
          >
            <X size={18} />
          </button>
        </div>
      )}

      <form className="issue-form" onSubmit={handleSubmit} noValidate>
        {/* Field 1: Location */}
        <div className={`form-group ${touched.location && errors.location ? 'has-error' : ''}`}>
          <label htmlFor="issue-location" className="form-label">
            <span>Location / Water Source</span>
            <span className="required-asterisk">*</span>
          </label>
          <div className="input-with-icon">
            <MapPin size={18} className="field-icon" />
            <input
              type="text"
              id="issue-location"
              name="location"
              className={`form-input ${touched.location && errors.location ? 'input-error' : ''}`}
              placeholder="e.g., Rampur North Well #2 or Block B Supply Pipeline"
              value={formData.location}
              onChange={handleChange}
              onBlur={handleBlur}
              aria-invalid={Boolean(touched.location && errors.location)}
              aria-describedby={errors.location ? 'location-error' : undefined}
              required
            />
          </div>
          {touched.location && errors.location && (
            <div id="location-error" className="field-error-msg" role="alert">
              <AlertCircle size={14} />
              <span>{errors.location}</span>
            </div>
          )}
        </div>

        {/* Field 2: Issue Type */}
        <div className="form-group">
          <label htmlFor="issue-type" className="form-label">
            <span>Category / Primary Symptom</span>
          </label>
          <div className="input-with-icon">
            <Droplet size={18} className="field-icon" />
            <select
              id="issue-type"
              name="issueType"
              className="form-select"
              value={formData.issueType}
              onChange={handleChange}
            >
              {ISSUE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Field 3: Severity Level */}
        <div className={`form-group ${touched.severity && errors.severity ? 'has-error' : ''}`}>
          <label className="form-label">
            <span>Severity Level</span>
            <span className="required-asterisk">*</span>
          </label>
          <div className="severity-grid">
            {SEVERITY_LEVELS.map((sev) => {
              const isSelected = formData.severity === sev.id;
              return (
                <button
                  type="button"
                  key={sev.id}
                  className={`severity-card ${sev.badgeClass} ${isSelected ? 'active' : ''}`}
                  onClick={() => handleSeveritySelect(sev.id)}
                  aria-pressed={isSelected}
                >
                  <div className="severity-header">
                    <span className="severity-radio">
                      <span className={`radio-inner ${isSelected ? 'checked' : ''}`}></span>
                    </span>
                    <span className="severity-title">{sev.label}</span>
                  </div>
                  <span className="severity-desc">{sev.desc}</span>
                </button>
              );
            })}
          </div>
          {touched.severity && errors.severity && (
            <div className="field-error-msg" role="alert">
              <AlertCircle size={14} />
              <span>{errors.severity}</span>
            </div>
          )}
        </div>

        {/* Field 4: Description */}
        <div className={`form-group ${touched.description && errors.description ? 'has-error' : ''}`}>
          <div className="label-with-count">
            <label htmlFor="issue-description" className="form-label">
              <span>Issue Description</span>
              <span className="required-asterisk">*</span>
            </label>
            <span className="char-counter">
              {formData.description.length} / 500
            </span>
          </div>
          <div className="textarea-wrapper">
            <FileText size={18} className="textarea-icon" />
            <textarea
              id="issue-description"
              name="description"
              rows={4}
              maxLength={500}
              className={`form-textarea ${touched.description && errors.description ? 'input-error' : ''}`}
              placeholder="Describe the water quality issue in detail (e.g., discolored water, foul smell, sediment, symptoms reported by villagers)..."
              value={formData.description}
              onChange={handleChange}
              onBlur={handleBlur}
              aria-invalid={Boolean(touched.description && errors.description)}
              aria-describedby={errors.description ? 'desc-error' : undefined}
              required
            />
          </div>
          {touched.description && errors.description && (
            <div id="desc-error" className="field-error-msg" role="alert">
              <AlertCircle size={14} />
              <span>{errors.description}</span>
            </div>
          )}
        </div>

        {/* Reporter Context Note */}
        <div className="reporter-info-note">
          <Info size={16} color="#38bdf8" />
          <span>
            Reporting as <strong>{user?.name || 'Authenticated Representative'}</strong> ({user?.email || 'Logged User'}) for village <strong>{user?.village || 'Rampur Central'}</strong>.
          </span>
        </div>

        {/* Form Action Buttons (Submit & Reset) */}
        <div className="form-actions">
          <button
            type="button"
            className="reset-report-btn"
            onClick={handleReset}
            disabled={isSubmitting}
            title="Clear all fields"
          >
            <RotateCcw size={16} />
            <span>Reset Form</span>
          </button>
          <button
            type="submit"
            className="submit-report-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner" style={{ width: '16px', height: '16px', borderTopColor: '#fff' }}></span>
                <span>Submitting Report...</span>
              </>
            ) : (
              <>
                <Send size={18} />
                <span>Submit Water Issue Report</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
