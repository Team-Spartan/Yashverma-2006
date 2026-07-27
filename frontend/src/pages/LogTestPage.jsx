import React, { useState } from 'react';
import { createWaterLog } from '../services/waterLogService';
import { PlusCircle, CheckCircle } from 'lucide-react';

export default function LogTestPage() {
  const [formData, setFormData] = useState({
    waterSourceId: '',
    ph: 7.2,
    turbidity: 1.0,
    tds: 300,
    nitrates: 10,
    fluoride: 0.5,
    dissolvedOxygen: 6.5,
    eColiPresent: false,
    remarks: ''
  });

  const [message, setMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      await createWaterLog(formData);
      setMessage({ type: 'success', text: 'Water quality test logged successfully! WQI computed.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to submit log entry.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 800 }}>
      <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Log Water Quality Test Result</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        Record chemical and biological testing metrics from village field testing kits (FTKs).
      </p>

      {message && (
        <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', background: message.type === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', border: `1px solid ${message.type === 'success' ? '#10b981' : '#ef4444'}`, color: message.type === 'success' ? '#34d399' : '#f87171', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle size={18} /> {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-card">
        <div className="form-group">
          <label>Water Source ID / Name</label>
          <input
            type="text"
            name="waterSourceId"
            className="form-input"
            placeholder="e.g. 660a123b456c789d00e12345 (or Select Source)"
            value={formData.waterSourceId}
            onChange={handleChange}
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label>pH Level (Standard: 6.5 - 8.5)</label>
            <input type="number" step="0.1" name="ph" className="form-input" value={formData.ph} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Turbidity (NTU limit: 5)</label>
            <input type="number" step="0.1" name="turbidity" className="form-input" value={formData.turbidity} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Total Dissolved Solids (TDS mg/L)</label>
            <input type="number" name="tds" className="form-input" value={formData.tds} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Nitrates (mg/L limit: 45)</label>
            <input type="number" name="nitrates" className="form-input" value={formData.nitrates} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Fluoride (mg/L limit: 1.5)</label>
            <input type="number" step="0.1" name="fluoride" className="form-input" value={formData.fluoride} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Dissolved Oxygen (mg/L)</label>
            <input type="number" step="0.1" name="dissolvedOxygen" className="form-input" value={formData.dissolvedOxygen} onChange={handleChange} />
          </div>
        </div>

        <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.75rem', margin: '1rem 0' }}>
          <input type="checkbox" id="eColi" name="eColiPresent" checked={formData.eColiPresent} onChange={handleChange} style={{ width: 18, height: 18 }} />
          <label htmlFor="eColi" style={{ cursor: 'pointer', color: '#f87171', fontWeight: 600 }}>
            E. Coli / Harmful Bacteria Detected in Sample
          </label>
        </div>

        <div className="form-group">
          <label>Field Notes & Observations</label>
          <textarea
            name="remarks"
            rows="3"
            className="form-input"
            placeholder="Mention odor, color changes, or weather conditions..."
            value={formData.remarks}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="btn-primary" disabled={submitting} style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}>
          <PlusCircle size={18} /> {submitting ? 'Computing WQI & Saving...' : 'Submit Water Test Log'}
        </button>
      </form>
    </div>
  );
}
