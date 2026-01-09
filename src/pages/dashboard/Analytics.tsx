import React, { createContext, useContext, useMemo, useRef, useState } from 'react';
import { Activity, Database, Upload } from 'lucide-react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

// --- Types ---
type ResultRow = {
  window_index: number;
  error: number;
  threshold: number;
  is_anomaly: boolean;
};

type UploadMeta = {
  rpm: string;
  abnormal_count: number;
  total_windows: number;
};

const AI_BASE = (import.meta as any).env?.VITE_AI_BASE_URL || 'http://127.0.0.1:8000';

const AnalyticsStateContext = createContext<any>(undefined);

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const [rows, setRows] = useState<ResultRow[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [uploadMeta, setUploadMeta] = useState<UploadMeta | null>(null);
  const [selectedRpm, setSelectedRpm] = useState<string>('800');

  return (
    <AnalyticsStateContext.Provider
      value={{
        rows,
        setRows,
        file,
        setFile,
        uploadMeta,
        setUploadMeta,
        selectedRpm,
        setSelectedRpm,
      }}
    >
      {children}
    </AnalyticsStateContext.Provider>
  );
}

export default function Analytics() {
  const context = useContext(AnalyticsStateContext);
  if (!context) throw new Error('AnalyticsProvider missing');

  const { rows, setRows, file, setFile, uploadMeta, setUploadMeta, selectedRpm, setSelectedRpm } =
    context;

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const rpmOptions = ['800', '1000', '1200'];

  const maxError = useMemo(() => {
    if (rows.length === 0) return 0;
    return Math.max(...rows.map((r: ResultRow) => r.error));
  }, [rows]);

  const currentThreshold = useMemo(() => {
    return rows.length > 0 ? rows[0].threshold : 0;
  }, [rows]);

  const run = async () => {
    if (!file) {
      setErrorMsg('CSV 파일을 선택해주세요.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);

    try {
      const form = new FormData();
      form.append('file', file);
      form.append('rpm', selectedRpm);
      form.append('user_id', '1');

      const response = await fetch(`${AI_BASE}/predict`, {
        method: 'POST',
        body: form,
      });

      const result = await response.json();
      if (!response.ok || result.status === 'error') {
        throw new Error(result.message || `서버 에러: ${response.status}`);
      }

      const backendData = result.data || [];
      const abnormalCount = backendData.filter((r: ResultRow) => r.is_anomaly).length;

      setUploadMeta({
        rpm: result.rpm || selectedRpm,
        abnormal_count: abnormalCount,
        total_windows: backendData.length,
      });

      setRows(backendData);
    } catch (e: any) {
      setErrorMsg(e.message || '서버와 통신 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: 25,
        background: '#f4f7f6',
        minHeight: '100vh',
        fontFamily: 'sans-serif',
      }}
    >
      <header
        style={{
          marginBottom: 25,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              color: '#2d3748',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <Activity size={24} color="#6b46c1" /> Nut Loosening Analysis
          </h2>
          <p style={{ color: '#718096', fontSize: 14, marginTop: 4 }}>
            AutoEncoder 기반 실시간 진동 데이터 이상 탐지
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <span
            style={{
              fontSize: 12,
              padding: '6px 12px',
              background: '#fff',
              borderRadius: 20,
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            <Database size={14} color="#38a169" /> Model Server Active
          </span>
        </div>
      </header>

      <div
        style={{
          background: '#fff',
          padding: 20,
          borderRadius: 12,
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
          marginBottom: 20,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 20,
          alignItems: 'center',
        }}
      >
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: '#4a5568' }}>
            TARGET RPM
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {rpmOptions.map((rpm) => (
              <button
                key={rpm}
                onClick={() => setSelectedRpm(rpm)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 6,
                  border: '1px solid',
                  borderColor: selectedRpm === rpm ? '#6b46c1' : '#e2e8f0',
                  background: selectedRpm === rpm ? '#6b46c1' : '#fff',
                  color: selectedRpm === rpm ? '#fff' : '#4a5568',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                {rpm} RPM
              </button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 300 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: '#4a5568' }}>
            DATA UPLOAD (.csv)
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              style={{ display: 'none' }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                padding: '10px 18px',
                borderRadius: 8,
                border: '1px solid #cbd5e0',
                background: '#fff',
                cursor: 'pointer',
                fontSize: 14,
              }}
            >
              <Upload size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} /> 파일 선택
            </button>
            <span style={{ fontSize: 14, color: file ? '#2d3748' : '#a0aec0', fontWeight: 500 }}>
              {file ? file.name : '데이터 파일을 업로드하세요'}
            </span>
            <button
              onClick={run}
              disabled={loading || !file}
              style={{
                marginLeft: 'auto',
                padding: '10px 24px',
                borderRadius: 8,
                border: 'none',
                background: loading || !file ? '#cbd5e0' : '#6b46c1',
                color: '#fff',
                cursor: loading || !file ? 'not-allowed' : 'pointer',
                fontWeight: 700,
                boxShadow: '0 4px 6px rgba(107, 70, 193, 0.2)',
              }}
            >
              {loading ? '분석 중...' : '분석 실행'}
            </button>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div
          style={{
            background: '#fff5f5',
            color: '#c53030',
            padding: '12px 20px',
            borderRadius: 8,
            marginBottom: 20,
            borderLeft: '4px solid #c53030',
          }}
        >
          {errorMsg}
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 20,
          marginBottom: 20,
        }}
      >
        <SummaryCard
          title="Analysis Status"
          value={
            rows.length === 0
              ? 'READY'
              : (uploadMeta?.abnormal_count ?? 0) > 0
                ? 'ANOMALY'
                : 'NORMAL'
          }
          color={
            rows.length === 0
              ? '#a0aec0'
              : (uploadMeta?.abnormal_count ?? 0) > 0
                ? '#e53e3e'
                : '#38a169'
          }
        />
        <SummaryCard
          title="Max Recon Error"
          value={rows.length ? maxError.toFixed(6) : '0.000000'}
        />
        <SummaryCard
          title="Active Threshold"
          value={currentThreshold ? currentThreshold.toFixed(6) : '0.000000'}
        />
        <SummaryCard
          title="Abnormal Windows"
          value={uploadMeta ? `${uploadMeta.abnormal_count} / ${uploadMeta.total_windows}` : '-'}
          color={(uploadMeta?.abnormal_count ?? 0) > 0 ? '#e53e3e' : '#2d3748'}
        />
      </div>

      {rows.length > 0 && (
        <div
          style={{
            background: '#fff',
            padding: 20,
            borderRadius: 12,
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
            marginBottom: 20,
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, color: '#2d3748' }}>
            Reconstruction Error Trend
          </div>
          <div style={{ height: 300, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rows} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="window_index" />
                <YAxis />
                <Tooltip />
                <ReferenceLine
                  y={currentThreshold}
                  stroke="#e53e3e"
                  strokeDasharray="5 5"
                  label={{ value: 'Threshold', position: 'right', fill: '#e53e3e' }}
                />
                <Line
                  type="monotone"
                  dataKey="error"
                  stroke="#6b46c1"
                  strokeWidth={2}
                  dot={(props: any) => {
                    const { cx, cy, payload } = props;
                    return payload.is_anomaly ? (
                      <circle key={payload.window_index} cx={cx} cy={cy} r={4} fill="#e53e3e" />
                    ) : (
                      <circle key={payload.window_index} cx={cx} cy={cy} r={2} fill="#6b46c1" />
                    );
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div
        style={{
          background: '#fff',
          borderRadius: 12,
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '18px 20px',
            borderBottom: '1px solid #edf2f7',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h3 style={{ margin: 0, fontSize: 16, color: '#2d3748' }}>FFT Window Detailed Results</h3>
          {uploadMeta?.rpm && (
            <span
              style={{
                background: '#6b46c1',
                color: '#fff',
                padding: '4px 12px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              Detected: {uploadMeta.rpm} RPM
            </span>
          )}
        </div>

        {rows.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#a0aec0' }}>
            분석 결과가 여기에 표시됩니다. 먼저 CSV 파일을 업로드하세요.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', color: '#718096', fontSize: 12 }}>
                  <th style={{ padding: '12px 20px', fontWeight: 700 }}>WIN INDEX</th>
                  <th style={{ padding: '12px 20px', fontWeight: 700 }}>RECON ERROR</th>
                  <th style={{ padding: '12px 20px', fontWeight: 700 }}>RESULT</th>
                  <th style={{ padding: '12px 20px', fontWeight: 700, width: '25%' }}>
                    DISTRIBUTION
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r: ResultRow) => {
                  const ratio = r.threshold > 0 ? Math.min((r.error / r.threshold) * 50, 100) : 0;
                  return (
                    <tr
                      key={r.window_index}
                      style={{
                        borderBottom: '1px solid #edf2f7',
                        background: r.is_anomaly ? '#fff5f5' : 'transparent',
                      }}
                    >
                      <td style={{ padding: '14px 20px', fontSize: 14 }}>#{r.window_index}</td>
                      <td style={{ padding: '14px 20px', fontSize: 14, fontWeight: 700 }}>
                        {r.error.toFixed(6)}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span
                          style={{
                            padding: '4px 8px',
                            borderRadius: 4,
                            fontSize: 11,
                            fontWeight: 800,
                            background: r.is_anomaly ? '#fed7d7' : '#c6f6d5',
                            color: r.is_anomaly ? '#c53030' : '#2f855a',
                          }}
                        >
                          {r.is_anomaly ? 'ABNORMAL' : 'NORMAL'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <div
                          style={{
                            height: 8,
                            width: '100%',
                            background: '#edf2f7',
                            borderRadius: 4,
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              height: '100%',
                              width: `${ratio}%`,
                              background: r.is_anomaly ? '#e53e3e' : '#38a169',
                              transition: 'width 0.3s ease',
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  color = '#2d3748',
}: {
  title: string;
  value: string;
  color?: string;
}) {
  return (
    <div
      style={{
        background: '#fff',
        padding: 20,
        borderRadius: 12,
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      }}
    >
      <div style={{ color: '#718096', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>
        {title}
      </div>
      <div style={{ fontSize: 24, fontWeight: 900, marginTop: 8, color }}>{value}</div>
    </div>
  );
}
