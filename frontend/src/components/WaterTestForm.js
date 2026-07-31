import React, { useState, useEffect, useCallback } from 'react';

const validate = (data) => {
  const errors = {};
  if (!data.village?.trim()) errors.village = 'Village is required';
  if (!data.sourceName?.trim()) errors.sourceName = 'Water source name is required';
  if (!data.sourceType) errors.sourceType = 'Source type is required';
  if (!data.overallStatus) errors.overallStatus = 'Overall status is required';
  if (data.ph !== '' && data.ph !== undefined && data.ph !== null) {
    const ph = parseFloat(data.ph);
    if (isNaN(ph) || ph < 0 || ph > 14) errors.ph = 'pH must be between 0 and 14';
  }
  if (data.turbidity !== '' && data.turbidity !== undefined && data.turbidity !== null) {
    const turbidity = parseFloat(data.turbidity);
    if (isNaN(turbidity) || turbidity < 0) errors.turbidity = 'Turbidity must be a positive number';
  }
  if (data.tds !== '' && data.tds !== undefined && data.tds !== null) {
    const tds = parseFloat(data.tds);
    if (isNaN(tds) || tds < 0) errors.tds = 'TDS must be a positive number';
  }
  if (data.chlorine !== '' && data.chlorine !== undefined && data.chlorine !== null) {
    const chlorine = parseFloat(data.chlorine);
    if (isNaN(chlorine) || chlorine < 0) errors.chlorine = 'Chlorine must be a positive number';
  }
  if (data.temperature !== '' && data.temperature !== undefined && data.temperature !== null) {
    const temp = parseFloat(data.temperature);
    if (isNaN(temp)) errors.temperature = 'Temperature must be a valid number';
  }
  if (!data.testDate) errors.testDate = 'Test date is required';
  return errors;
};

const defaultForm = {
  village: '',
  sourceName: '',
  sourceType: 'well',
  testDate: new Date().toISOString().split('T')[0],
  ph: '',
  turbidity: '',
  turbidityUnit: 'NTU',
  tds: '',
  tdsUnit: 'ppm',
  chlorine: '',
  chlorineUnit: 'mg/L',
  temperature: '',
  bacteriaTest: 'not_tested',
  overallStatus: 'safe',
  notes: '',
};

const parseSubmitError = (err) => {
  const data = err.response?.data;
  if (!data) return 'Network error. Please check your connection and try again.';
  if (data.errors && Array.isArray(data.errors)) {
    return data.errors.map((e) => e.msg || e.message).join('. ');
  }
  return data.message || 'Failed to save test result. Please try again.';
};

const WaterTestForm = ({ initialData, onSubmit, onCancel, isEditing = false }) => {
  const getInitialForm = () => {
    if (!initialData) return defaultForm;
    return {
      village: initialData.village || '',
      sourceName: initialData.sourceName || '',
      sourceType: initialData.sourceType || 'well',
      testDate: initialData.testDate
        ? new Date(initialData.testDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      ph: initialData.ph ?? '',
      turbidity: initialData.turbidity ?? '',
      turbidityUnit: initialData.turbidityUnit || 'NTU',
      tds: initialData.tds ?? '',
      tdsUnit: initialData.tdsUnit || 'ppm',
      chlorine: initialData.chlorine ?? '',
      chlorineUnit: initialData.chlorineUnit || 'mg/L',
      temperature: initialData.temperature ?? '',
      bacteriaTest: initialData.bacteriaTest || 'not_tested',
      overallStatus: initialData.overallStatus || 'safe',
      notes: initialData.notes || '',
    };
  };

  const [form, setForm] = useState(getInitialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape' && !submitting) onCancel();
  }, [onCancel, submitting]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...form,
        ph: form.ph !== '' ? parseFloat(form.ph) : undefined,
        turbidity: form.turbidity !== '' ? parseFloat(form.turbidity) : undefined,
        tds: form.tds !== '' ? parseFloat(form.tds) : undefined,
        chlorine: form.chlorine !== '' ? parseFloat(form.chlorine) : undefined,
        temperature: form.temperature !== '' ? parseFloat(form.temperature) : undefined,
      };
      await onSubmit(payload);
    } catch (err) {
      setSubmitError(parseSubmitError(err));
    }
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      {submitError && <div className="alert alert-error">{submitError}</div>}

      <fieldset disabled={submitting} style={{ border: 'none', padding: 0, margin: 0 }}>
        <div className="form-row">
          <div className="form-group">
            <label>Village *</label>
            <input
              type="text"
              name="village"
              className={`form-control ${errors.village ? 'error' : ''}`}
              value={form.village}
              onChange={handleChange}
              placeholder="Village name"
            />
            {errors.village && <span className="error-text">{errors.village}</span>}
          </div>
          <div className="form-group">
            <label>Test Date *</label>
            <input
              type="date"
              name="testDate"
              className={`form-control ${errors.testDate ? 'error' : ''}`}
              value={form.testDate}
              onChange={handleChange}
            />
            {errors.testDate && <span className="error-text">{errors.testDate}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Source Name *</label>
            <input
              type="text"
              name="sourceName"
              className={`form-control ${errors.sourceName ? 'error' : ''}`}
              value={form.sourceName}
              onChange={handleChange}
              placeholder="e.g., Main Well, Handpump #3"
            />
            {errors.sourceName && <span className="error-text">{errors.sourceName}</span>}
          </div>
          <div className="form-group">
            <label>Source Type *</label>
            <select
              name="sourceType"
              className={`form-control ${errors.sourceType ? 'error' : ''}`}
              value={form.sourceType}
              onChange={handleChange}
            >
              <option value="well">Well</option>
              <option value="handpump">Handpump</option>
              <option value="tap">Tap Water</option>
              <option value="river">River</option>
              <option value="pond">Pond</option>
              <option value="other">Other</option>
            </select>
            {errors.sourceType && <span className="error-text">{errors.sourceType}</span>}
          </div>
        </div>

        <div className="form-row-3">
          <div className="form-group">
            <label>pH Level</label>
            <input
              type="number"
              name="ph"
              className={`form-control ${errors.ph ? 'error' : ''}`}
              value={form.ph}
              onChange={handleChange}
              placeholder="0 - 14"
              step="0.1"
              min="0"
              max="14"
            />
            {errors.ph && <span className="error-text">{errors.ph}</span>}
          </div>
          <div className="form-group">
            <label>Turbidity ({form.turbidityUnit})</label>
            <input
              type="number"
              name="turbidity"
              className={`form-control ${errors.turbidity ? 'error' : ''}`}
              value={form.turbidity}
              onChange={handleChange}
              placeholder="e.g., 5"
              step="0.1"
              min="0"
            />
            {errors.turbidity && <span className="error-text">{errors.turbidity}</span>}
          </div>
          <div className="form-group">
            <label>TDS ({form.tdsUnit})</label>
            <input
              type="number"
              name="tds"
              className={`form-control ${errors.tds ? 'error' : ''}`}
              value={form.tds}
              onChange={handleChange}
              placeholder="e.g., 300"
              step="1"
              min="0"
            />
            {errors.tds && <span className="error-text">{errors.tds}</span>}
          </div>
        </div>

        <div className="form-row-3">
          <div className="form-group">
            <label>Chlorine ({form.chlorineUnit})</label>
            <input
              type="number"
              name="chlorine"
              className={`form-control ${errors.chlorine ? 'error' : ''}`}
              value={form.chlorine}
              onChange={handleChange}
              placeholder="e.g., 0.5"
              step="0.01"
              min="0"
            />
            {errors.chlorine && <span className="error-text">{errors.chlorine}</span>}
          </div>
          <div className="form-group">
            <label>Temperature (°C)</label>
            <input
              type="number"
              name="temperature"
              className={`form-control ${errors.temperature ? 'error' : ''}`}
              value={form.temperature}
              onChange={handleChange}
              placeholder="e.g., 28"
              step="0.1"
            />
            {errors.temperature && <span className="error-text">{errors.temperature}</span>}
          </div>
          <div className="form-group">
            <label>Bacteria Test</label>
            <select
              name="bacteriaTest"
              className="form-control"
              value={form.bacteriaTest}
              onChange={handleChange}
            >
              <option value="not_tested">Not Tested</option>
              <option value="safe">Safe</option>
              <option value="unsafe">Unsafe</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Overall Status *</label>
            <select
              name="overallStatus"
              className={`form-control ${errors.overallStatus ? 'error' : ''}`}
              value={form.overallStatus}
              onChange={handleChange}
            >
              <option value="safe">Safe</option>
              <option value="caution">Caution</option>
              <option value="unsafe">Unsafe</option>
            </select>
            {errors.overallStatus && <span className="error-text">{errors.overallStatus}</span>}
          </div>
          <div className="form-group">
            <label>Notes</label>
            <input
              type="text"
              name="notes"
              className="form-control"
              value={form.notes}
              onChange={handleChange}
              placeholder="Any additional observations"
              maxLength={500}
            />
          </div>
        </div>
      </fieldset>

      <div className="modal-footer" style={{ padding: 0, border: 'none', marginTop: 16 }}>
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
        <button type="submit" className={`btn btn-primary ${submitting ? 'btn-loading' : ''}`} disabled={submitting}>
          {submitting && <span className="btn-spinner" />}
          {submitting ? (isEditing ? 'Updating...' : 'Saving...') : isEditing ? 'Update Test Result' : 'Add Test Result'}
        </button>
      </div>
    </form>
  );
};

export default WaterTestForm;
