import React, { useState } from 'react';
import { X, Send, AlertOctagon } from 'lucide-react';

export const IssueReportModal = ({ isOpen, onClose, onSave, user, villages }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    village: user ? user.village || 'Rampur' : 'Rampur',
    district: 'Varanasi',
    locationDetails: '',
    issueType: 'Contamination',
    severity: 'High'
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertOctagon size={22} color="#ef4444" />
            Report Water Contamination / Infrastructure Incident
          </h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Incident Summary / Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Yellowish water from school handpump / Pipe leakage near market"
              className="form-control"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Issue Category</label>
              <select
                className="form-control"
                value={formData.issueType}
                onChange={(e) => setFormData({ ...formData, issueType: e.target.value })}
              >
                <option value="Contamination">Water Contamination / Foul Odor</option>
                <option value="Pipe Leakage">Feeder Pipe Leakage / Burst</option>
                <option value="Pump Failure">Handpump / Solar Motor Breakdown</option>
                <option value="Chemical Runoff">Agricultural / Industrial Runoff</option>
                <option value="Water Scarcity">Source Drying / Supply Interruption</option>
              </select>
            </div>

            <div className="form-group">
              <label>Severity Level</label>
              <select
                className="form-control"
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
              >
                <option value="Critical">Critical (Immediate Health Threat)</option>
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
            </div>

            <div className="form-group">
              <label>Village Location *</label>
              <select
                className="form-control"
                value={formData.village}
                onChange={(e) => setFormData({ ...formData, village: e.target.value })}
              >
                {villages.map(v => (
                  <option key={v.id} value={v.name}>{v.name} ({v.district})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Specific Location / Landmark</label>
              <input
                type="text"
                required
                placeholder="e.g. Ward 4, opposite Primary Health Center"
                className="form-control"
                value={formData.locationDetails}
                onChange={(e) => setFormData({ ...formData, locationDetails: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Detailed Incident Description *</label>
            <textarea
              rows="3"
              required
              className="form-control"
              placeholder="Describe color, odor, symptoms experienced by villagers, estimated number of affected households..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            ></textarea>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.85rem', marginTop: '1.25rem' }}>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary" style={{ background: 'linear-gradient(135deg, #ef4444, #f59e0b)' }}>
              <Send size={18} /> Submit Alert to Panchayat
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
