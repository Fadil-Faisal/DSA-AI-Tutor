'use client';

import { useState, useEffect, useCallback } from 'react';

const STATE_COLORS: Record<string, string> = {
  frustrated: '#E24B4A',
  in_flow: '#1D9E75',
  overconfident: '#EF9F27',
  lost: '#888780',
  bored: '#534AB7',
};

const STATE_EMOJI: Record<string, string> = {
  frustrated: '😤',
  in_flow: '🎯',
  overconfident: '😏',
  lost: '😶',
  bored: '😴',
};

interface Prediction {
  id: string;
  predicted_state: string;
  confidence: number;
  recommendation: string;
  explanation: string;
  signals_snapshot: {
    timeOnProblemSeconds: number;
    hintLevel: number;
    codeEditsPerMinute: number;
    submitAttempts: number;
    passedTests: number;
    totalTests: number;
    accuracy: number;
    frustrationIndex: number;
    engagementScore: number;
  };
  created_at: string;
  ai_source?: string;
}

export default function DemoPage() {
  const [sessionId, setSessionId] = useState('');
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  const fetchPredictions = useCallback(async () => {
    if (!sessionId) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/behavior/predictions?sessionId=${sessionId}&limit=10`);
      const data = await res.json();
      
      if (data.predictions && data.predictions.length > 0) {
        setPredictions(data.predictions);
        setLastUpdate(new Date().toLocaleTimeString());
      }
    } catch (e) {
      console.error('Failed to fetch predictions:', e);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    if (sessionId && autoRefresh) {
      fetchPredictions();
      const interval = setInterval(fetchPredictions, 5000);
      return () => clearInterval(interval);
    }
  }, [sessionId, autoRefresh, fetchPredictions]);

  const latestPrediction = predictions[0];
  const stateColor = latestPrediction ? STATE_COLORS[latestPrediction.predicted_state] : '#888780';
  const emoji = latestPrediction ? STATE_EMOJI[latestPrediction.predicted_state] : '❓';

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a1a', padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: '#fff', margin: '0 0 8px' }}>
            🧠 Behavioral AI Monitor — Live Data
          </h1>
          <p style={{ fontSize: 14, color: '#71717a', margin: 0 }}>
            Real-time student monitoring from Supabase • Time, Accuracy & Predictions
          </p>
        </div>

        <div style={{ background: '#18181b', borderRadius: 12, padding: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <label style={{ fontSize: 12, color: '#71717a', display: 'block', marginBottom: 4 }}>
                Session ID (from student URL)
              </label>
              <input
                type="text"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                placeholder="Enter session ID (e.g., session-abc123...)"
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #3f3f46',
                  background: '#27272a', color: '#fff', fontSize: 14
                }}
              />
            </div>
            <button
              onClick={fetchPredictions}
              disabled={!sessionId || loading}
              style={{
                padding: '10px 20px', borderRadius: 8, border: 'none', background: '#f59e0b',
                color: '#000', fontWeight: 600, cursor: loading ? 'wait' : 'pointer',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Fetching...' : '🔄 Fetch Data'}
            </button>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                style={{ width: 18, height: 18 }}
              />
              <span style={{ color: '#fff', fontSize: 14 }}>Auto-refresh (5s)</span>
            </label>
          </div>
          {lastUpdate && (
            <div style={{ fontSize: 12, color: '#71717a', marginTop: 8 }}>
              Last updated: {lastUpdate}
            </div>
          )}
        </div>

        {predictions.length === 0 && sessionId && (
          <div style={{ background: '#18181b', borderRadius: 12, padding: '2rem', textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
            <div style={{ color: '#71717a', fontSize: 16 }}>
              No predictions yet for session: <strong style={{ color: '#fff' }}>{sessionId}</strong>
            </div>
            <div style={{ color: '#52525b', fontSize: 14, marginTop: 8 }}>
              Start a student on Level 4 and watch data appear here
            </div>
          </div>
        )}

        {latestPrediction && (
          <div style={{
            background: '#18181b',
            borderRadius: 16,
            padding: '1.5rem',
            marginBottom: '1.5rem',
            border: `2px solid ${stateColor}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
              <span style={{ fontSize: 56 }}>{emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: '#71717a' }}>Current State</div>
                <div style={{ fontSize: 32, fontWeight: 600, color: stateColor, textTransform: 'uppercase' }}>
                  {latestPrediction.predicted_state}
                </div>
                {latestPrediction.explanation && (
                  <div style={{ fontSize: 13, color: '#a1a1aa', marginTop: 4 }}>
                    {latestPrediction.explanation}
                  </div>
                )}
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 12, color: '#71717a' }}>AI Confidence</div>
                <div style={{ fontSize: 36, fontWeight: 600, color: stateColor }}>
                  {Math.round(latestPrediction.confidence * 100)}%
                </div>
                <div style={{ fontSize: 11, color: '#71717a' }}>{latestPrediction.ai_source || 'AI'}</div>
              </div>
            </div>

            <div style={{ background: '#27272a', borderRadius: 8, padding: '0.75rem 1rem', marginBottom: 16 }}>
              <span style={{ fontSize: 13, color: '#f59e0b', fontWeight: 500 }}>→ </span>
              <span style={{ fontSize: 13, color: '#f59e0b' }}>{latestPrediction.recommendation}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
              <MetricBox label="Time" value={formatTime(latestPrediction.signals_snapshot.timeOnProblemSeconds)} />
              <MetricBox label="Hints" value={`${latestPrediction.signals_snapshot.hintLevel}/3`} />
              <MetricBox label="Edits/min" value={latestPrediction.signals_snapshot.codeEditsPerMinute} />
              <MetricBox label="Submits" value={latestPrediction.signals_snapshot.submitAttempts} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              <div>
                <div style={{ fontSize: 11, color: '#71717a', marginBottom: 6 }}>Accuracy</div>
                <div style={{ background: '#27272a', borderRadius: 4, height: 10 }}>
                  <div style={{ 
                    width: `${latestPrediction.signals_snapshot.accuracy}%`, 
                    height: '100%', 
                    background: '#10b981', 
                    borderRadius: 4 
                  }} />
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#10b981', marginTop: 4 }}>
                  {latestPrediction.signals_snapshot.accuracy}%
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#71717a', marginBottom: 6 }}>Frustration</div>
                <div style={{ background: '#27272a', borderRadius: 4, height: 10 }}>
                  <div style={{ 
                    width: `${latestPrediction.signals_snapshot.frustrationIndex * 100}%`, 
                    height: '100%', 
                    background: '#E24B4A', 
                    borderRadius: 4 
                  }} />
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#E24B4A', marginTop: 4 }}>
                  {Math.round(latestPrediction.signals_snapshot.frustrationIndex * 100)}%
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#71717a', marginBottom: 6 }}>Engagement</div>
                <div style={{ background: '#27272a', borderRadius: 4, height: 10 }}>
                  <div style={{ 
                    width: `${latestPrediction.signals_snapshot.engagementScore * 100}%`, 
                    height: '100%', 
                    background: '#3b82f6', 
                    borderRadius: 4 
                  }} />
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#3b82f6', marginTop: 4 }}>
                  {Math.round(latestPrediction.signals_snapshot.engagementScore * 100)}%
                </div>
              </div>
            </div>
          </div>
        )}

        {predictions.length > 1 && (
          <div style={{ background: '#18181b', borderRadius: 12, padding: '1rem' }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: '#e4e4e7', marginBottom: 12 }}>
              Prediction History ({predictions.length} total)
            </div>
            {predictions.slice(0, 5).map((p, i) => (
              <div 
                key={p.id || i} 
                style={{ 
                  display: 'flex', alignItems: 'center', gap: 12, 
                  padding: '10px 0', borderBottom: i < 4 ? '1px solid #3f3f46' : 'none' 
                }}
              >
                <span style={{ fontSize: 24 }}>{STATE_EMOJI[p.predicted_state]}</span>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 14, fontWeight: 500, color: STATE_COLORS[p.predicted_state] }}>
                    {p.predicted_state}
                  </span>
                  <span style={{ fontSize: 12, color: '#71717a', marginLeft: 8 }}>
                    {Math.round(p.confidence * 100)}% conf
                  </span>
                </div>
                <div style={{ fontSize: 12, color: '#52525b' }}>
                  {formatTime(p.signals_snapshot.timeOnProblemSeconds)} • {p.signals_snapshot.accuracy}%
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: '2rem', background: '#18181b', borderRadius: 12, padding: '1rem' }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: '#e4e4e7', marginBottom: 8 }}>
            📋 How to use:
          </div>
          <ol style={{ fontSize: 13, color: '#71717a', paddingLeft: 20, lineHeight: 1.8 }}>
            <li>Open <strong style={{ color: '#f59e0b' }}>/level/4</strong> in a new tab and start solving the problem</li>
            <li>Copy the session ID from the browser (or it auto-appears in console)</li>
            <li>Paste it here and click "Fetch Data"</li>
            <li>Watch real-time predictions as you code, request hints, and submit!</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

function MetricBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ background: '#27272a', borderRadius: 8, padding: '0.75rem', textAlign: 'center' }}>
      <div style={{ fontSize: 11, color: '#71717a', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 600, color: '#fff' }}>{value}</div>
    </div>
  );
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}