import React, { useState, useEffect } from 'react';
import { X, Droplets, Save, Loader, CheckCircle, AlertTriangle } from 'lucide-react';

const PANEL_IDS = [
  'Sector 1', 'Sector 2', 'Sector 3', 'Sector 4', 'Sector 5', 'Sector 6',
  'Sector 7', 'Sector 8', 'Sector 9', 'Sector 10', 'Sector 11', 'Sector 12'
];

const BIS_LIMITS = {
  pH: { min: 6.5, max: 8.5, unit: '', ideal: 7.0, above: 'Alkaline water, may cause taste issues', below: 'Acidic water, corrosive to pipes' },
  turbidity: { min: 0, max: 5, unit: 'NTU', ideal: 1, above: 'Cloudy water, may indicate contamination' },
  tds: { min: 0, max: 500, unit: 'mg/L', ideal: 200, above: 'Hard water, salty taste, scaling' },
  hardness: { min: 0, max: 200, unit: 'mg/L', ideal: 100, above: 'Hard water, scaling, soap scum' },
  alkalinity: { min: 20, max: 200, unit: 'mg/L', ideal: 100, above: 'Bitter taste, pipe scaling', below: 'Corrosive water' },
  chloride: { min: 0, max: 250, unit: 'mg/L', ideal: 100, above: 'Salty taste, corrosion risk' },
  fluoride: { min: 0.5, max: 1.5, unit: 'mg/L', ideal: 0.8, above: 'Dental/skeletal fluorosis risk', below: 'Dental caries risk' },
  nitrate: { min: 0, max: 45, unit: 'mg/L', ideal: 20, above: 'Methemoglobinemia (blue baby syndrome)' },
  sulfate: { min: 0, max: 200, unit: 'mg/L', ideal: 50, above: 'Laxative effect, bitter taste' },
  iron: { min: 0, max: 0.3, unit: 'mg/L', ideal: 0.1, above: 'Metallic taste, staining, turbidity' },
  manganese: { min: 0, max: 0.1, unit: 'mg/L', ideal: 0.05, above: 'Brownish color, metallic taste, staining' },
  arsenic: { min: 0, max: 0.01, unit: 'mg/L', ideal: 0, above: 'Carcinogenic (skin, bladder, lung cancer)' },
  totalColiform: { min: 0, max: 0, unit: 'CFU/100mL', ideal: 0, above: 'Bacterial contamination, disease risk' },
  eColi: { min: 0, max: 0, unit: 'CFU/100mL', ideal: 0, above: 'Fecal contamination, severe health risk' }
};

const fieldLabels = {
  pH: 'pH Level', turbidity: 'Turbidity', tds: 'TDS (Total Dissolved Solids)',
  hardness: 'Total Hardness', alkalinity: 'Alkalinity', chloride: 'Chloride',
  fluoride: 'Fluoride', nitrate: 'Nitrate', sulfate: 'Sulfate',
  iron: 'Iron', manganese: 'Manganese', arsenic: 'Arsenic',
  totalColiform: 'Total Coliform', eColi: 'E. Coli'
};

const WQI_WEIGHTS = {
  pH: 0.1, turbidity: 0.08, tds: 0.08, hardness: 0.08, alkalinity: 0.08,
  chloride: 0.07, fluoride: 0.08, nitrate: 0.08, sulfate: 0.07,
  iron: 0.07, manganese: 0.06, arsenic: 0.1, totalColiform: 0.09, eColi: 0.1
};

const calcWQI = (values) => {
  let total = 0;
  let anyValid = false;
  for (const [key, limit] of Object.entries(BIS_LIMITS)) {
    const val = parseFloat(values[key]);
    if (isNaN(val) || val < 0) continue;
    anyValid = true;
    let qi = 100;
    if (val >= limit.min && val <= limit.max) {
      qi = 100 - Math.abs(val - limit.ideal) / (limit.max - limit.min) * 50;
    } else {
      qi = val < limit.min ? Math.max(0, 50 - (limit.min - val) * 5) : Math.max(0, 50 - (val - limit.max) * 5);
    }
    qi = Math.max(0, Math.min(100, qi));
    total += qi * (WQI_WEIGHTS[key] || 0);
  }
  if (!anyValid) return null;
  return Math.round(total * 10) / 10;
};

const getWQIColor = (wqi) => {
  if (wqi === null) return '#94a3b8';
  if (wqi >= 80) return '#10b981';
  if (wqi >= 60) return '#06b6d4';
  if (wqi >= 40) return '#f59e0b';
  return '#ef4444';
};

const getWQILabel = (wqi) => {
  if (wqi === null) return 'N/A';
  if (wqi >= 80) return 'Excellent';
  if (wqi >= 60) return 'Good';
  if (wqi >= 40) return 'Poor';
  if (wqi >= 20) return 'Very Poor';
  return 'Unsuitable';
};

export const WaterLogModal = ({ isOpen, onClose, onSubmit, submitting }) => {
  const initialForm = {
    ph: '', turbidity: '', tds: '', hardness: '', alkalinity: '',
    chloride: '', fluoride: '', nitrate: '', sulfate: '', iron: '',
    manganese: '', arsenic: '', totalColiform: '', eColi: '',
    village: '', district: '', panelId: '', source: '', collectorName: ''
  };

  const [formData, setFormData] = useState(initialForm);
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(initialForm);
      setTouched({});
      setErrors({});
      setSubmitError('');
      setSubmitSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (touched[field]) validateField(field, e.target.value);
  };

  const handleBlur = (field) => () => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, formData[field]);
  };

  const validateField = (field, value) => {
    if (field === 'village' || field === 'district' || field === 'panelId' || field === 'source' || field === 'collectorName') {
      const valid = value.trim().length > 0;
      setErrors(prev => ({ ...prev, [field]: valid ? '' : 'This field is required' }));
      return valid;
    }
    if (field === 'ph') {
      const num = parseFloat(value);
      if (value === '' || isNaN(num)) {
        setErrors(prev => ({ ...prev, [field]: 'Required' }));
        return false;
      }
      if (num < 0 || num > 14) {
        setErrors(prev => ({ ...prev, [field]: 'pH must be 0-14' }));
        return false;
      }
      const limit = BIS_LIMITS[field];
      if (limit && (num < limit.min || num > limit.max)) {
        setErrors(prev => ({ ...prev, [field]: `Out of BIS range (${limit.min}-${limit.max}). ${num < limit.min ? limit.below : limit.above}` }));
        return false;
      }
      setErrors(prev => ({ ...prev, [field]: '' }));
      return true;
    }
    if (BIS_LIMITS[field]) {
      const num = parseFloat(value);
      if (value === '' || isNaN(num) || num < 0) {
        setErrors(prev => ({ ...prev, [field]: 'Enter valid non-negative number' }));
        return false;
      }
      const limit = BIS_LIMITS[field];
      if (num > limit.max) {
        setErrors(prev => ({ ...prev, [field]: `Exceeds BIS limit (max ${limit.max} ${limit.unit}). ${limit.above || ''}` }));
        return false;
      }
      if ('min' in limit && num < limit.min && limit.min > 0) {
        setErrors(prev => ({ ...prev, [field]: `Below BIS minimum (min ${limit.min} ${limit.unit}). ${limit.below || ''}` }));
        return false;
      }
      setErrors(prev => ({ ...prev, [field]: '' }));
      return true;
    }
    setErrors(prev => ({ ...prev, [field]: '' }));
    return true;
  };

  const validateAll = () => {
    const allFields = Object.keys(formData);
    const newTouched = {};
    const newErrors = {};
    let valid = true;
    allFields.forEach(f => { newTouched[f] = true; });
    setTouched(newTouched);
    allFields.forEach(f => {
      const fvalid = validateField(f, formData[f]);
      if (!fvalid) valid = false;
      if (fvalid !== true) newErrors[f] = fvalid;
    });
    setErrors(prev => ({ ...prev, ...newErrors }));
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    if (!validateAll()) return;
    try {
      await onSubmit(formData);
      setSubmitSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setSubmitError(err.message || 'Submission failed. Please try again.');
    }
  };

  const wqi = calcWQI(formData);

  const hasErrors = Object.values(errors).some(e => e !== '');
  const isComplete = Object.values(formData).every(v => v !== '');

  const analysisFields = Object.keys(BIS_LIMITS);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '820px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Droplets color="#06b6d4" size={24} />
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Water Quality Test Entry</h2>
          </div>
          <button onClick={onClose} className="btn-icon" style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '8px', padding: '0.45rem', cursor: 'pointer' }}>
            <X size={20} color="var(--text-secondary)" />
          </button>
        </div>

        <div style={{ padding: '0 1.5rem', overflowY: 'auto', flex: 1 }}>
          {submitSuccess && (
            <div style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '10px', padding: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <CheckCircle size={22} color="#10b981" />
              <span style={{ fontWeight: 700, color: '#6ee7b7' }}>Water quality test log submitted successfully!</span>
            </div>
          )}

          {submitError && (
            <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <AlertTriangle size={22} color="#ef4444" />
              <span style={{ fontWeight: 600, color: '#fca5a5' }}>{submitError}</span>
            </div>
          )}

          {wqi !== null && (
            <div className="glass-panel" style={{ padding: '1rem 1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>WQI (Water Quality Index)</div>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: getWQIColor(wqi) }}>{wqi}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{
                  display: 'inline-block', padding: '0.35rem 1rem', borderRadius: '9999px', fontWeight: 800, fontSize: '0.9rem',
                  background: `${getWQIColor(wqi)}22`, color: getWQIColor(wqi),
                  border: `2px solid ${getWQIColor(wqi)}`
                }}>
                  {getWQILabel(wqi)}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                  Based on BIS IS 10500:2012 standards
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: '#38bdf8' }}>Sampling Location & Source</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                {[
                  { field: 'village', label: 'Village', type: 'text', placeholder: 'e.g., Kodaikanal' },
                  { field: 'district', label: 'District', type: 'text', placeholder: 'e.g., Dindigul' },
                  { field: 'panelId', label: 'Panel ID', type: 'select', options: PANEL_IDS },
                  { field: 'source', label: 'Water Source', type: 'select', options: ['Borewell', 'Hand Pump', 'Overhead Tank', 'Tap', 'River', 'Lake', 'Pond', 'Well'] },
                  { field: 'collectorName', label: 'Sample Collector', type: 'text', placeholder: 'e.g., V. Suresh' }
                ].map(({ field, label, type, placeholder, options }) => (
                  <div key={field}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>{label}</label>
                    {type === 'select' ? (
                      <select
                        value={formData[field]}
                        onChange={handleChange(field)}
                        onBlur={handleBlur(field)}
                        style={{
                          width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px',
                          background: touched[field] && errors[field] ? 'rgba(239,68,68,0.1)' : 'rgba(15,23,42,0.6)',
                          border: touched[field] && errors[field] ? '1px solid #ef4444' : '1px solid var(--border-color)',
                          color: 'var(--text-primary)', outline: 'none', fontSize: '0.85rem'
                        }}
                      >
                        <option value="">Select {label}</option>
                        {options.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={formData[field]}
                        onChange={handleChange(field)}
                        onBlur={handleBlur(field)}
                        placeholder={placeholder}
                        style={{
                          width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px',
                          background: touched[field] && errors[field] ? 'rgba(239,68,68,0.1)' : 'rgba(15,23,42,0.6)',
                          border: touched[field] && errors[field] ? '1px solid #ef4444' : '1px solid var(--border-color)',
                          color: 'var(--text-primary)', outline: 'none', fontSize: '0.85rem'
                        }}
                      />
                    )}
                    {touched[field] && errors[field] && (
                      <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem', fontWeight: 500 }}>{errors[field]}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: '#38bdf8' }}>Physicochemical Parameters</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                {analysisFields.map(field => {
                  const limit = BIS_LIMITS[field];
                  return (
                    <div key={field}>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                        {fieldLabels[field]}
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="number"
                          step="any"
                          value={formData[field]}
                          onChange={handleChange(field)}
                          onBlur={handleBlur(field)}
                          placeholder={`${limit.min}-${limit.max} ${limit.unit}`}
                          style={{
                            width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', boxSizing: 'border-box',
                            background: touched[field] && errors[field] ? 'rgba(239,68,68,0.1)' : 'rgba(15,23,42,0.6)',
                            border: touched[field] && errors[field] ? '1px solid #ef4444' : '1px solid var(--border-color)',
                            color: 'var(--text-primary)', outline: 'none', fontSize: '0.85rem', paddingRight: '2.5rem'
                          }}
                        />
                        {formData[field] !== '' && !isNaN(parseFloat(formData[field])) && parseFloat(formData[field]) >= 0 && (
                          <span style={{
                            position: 'absolute', right: '0.55rem', top: '50%', transform: 'translateY(-50%)',
                            fontSize: '0.7rem', fontWeight: 700,
                            color: errors[field] ? '#ef4444' : 'var(--text-muted)'
                          }}>
                            {limit.unit}
                          </span>
                        )}
                      </div>
                      {touched[field] && errors[field] && (
                        <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem', fontWeight: 500 }}>{errors[field]}</p>
                      )}
                      <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                        BIS range: {limit.min}–{limit.max} {limit.unit}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="modal-footer" style={{ borderTop: '1px solid var(--border-color)', padding: '1rem 0', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
              <button
                type="submit"
                disabled={submitting || hasErrors || !isComplete}
                style={{
                  padding: '0.65rem 1.5rem', borderRadius: '10px', border: 'none',
                  background: (submitting || hasErrors || !isComplete) ? 'rgba(6,182,212,0.3)' : 'linear-gradient(135deg, #06b6d4, #0891b2)',
                  color: (submitting || hasErrors || !isComplete) ? 'rgba(255,255,255,0.4)' : '#ffffff',
                  fontWeight: 800, fontSize: '0.9rem', cursor: (submitting || hasErrors || !isComplete) ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: submitting ? 'none' : '0 4px 15px rgba(6,182,212,0.4)'
                }}
              >
                {submitting ? (
                  <><Loader size={18} className="pulse" /> Submitting...</>
                ) : (
                  <><Save size={18} /> Save Water Quality Test Log</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
