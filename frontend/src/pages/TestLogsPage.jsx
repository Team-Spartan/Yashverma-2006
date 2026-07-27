import React, { useEffect, useState } from 'react';
import WaterTestTable from '../components/logs/WaterTestTable';
import { fetchWaterLogs } from '../services/waterLogService';
import { FileText, RefreshCw } from 'lucide-react';

export default function TestLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadTestLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchWaterLogs();
      setLogs(response.data || []);
    } catch (err) {
      console.error('[TestLogsPage Error]', err);
      setError('Unable to fetch water quality test logs from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTestLogs();
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText style={{ color: 'var(--accent-cyan)' }} /> Water Quality Test Records
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Comprehensive ledger of field lab measurements, WQI scores, and biological test results.
          </p>
        </div>
        <button onClick={loadTestLogs} className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
          <RefreshCw size={16} /> Refresh Records
        </button>
      </div>

      {error && (
        <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#f87171', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      <div className="glass-card" style={{ padding: '1rem' }}>
        <WaterTestTable logs={logs} loading={loading} />
      </div>
    </div>
  );
}
