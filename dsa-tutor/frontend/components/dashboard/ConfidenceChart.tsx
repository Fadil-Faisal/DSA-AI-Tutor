'use client';

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { getConfidenceColor, topicLabel } from '@/lib/utils';
import { Confidence, DSATopic } from '@/types/learner';

// Generate mock history for demo
function buildHistory(confidence: Confidence) {
  const topics = Object.keys(confidence) as DSATopic[];
  const points = 8;
  return Array.from({ length: points }, (_, i) => {
    const entry: Record<string, number | string> = { session: `S${i + 1}` };
    topics.forEach((t) => {
      const base = confidence[t];
      const noise = (Math.random() - 0.5) * 0.15;
      const progress = (i / points) * (base - 0.3);
      entry[t] = Math.max(0.1, Math.min(1, 0.3 + progress + noise));
    });
    return entry;
  });
}

interface ConfidenceChartProps {
  confidence: Confidence;
}

export function ConfidenceChart({ confidence }: ConfidenceChartProps) {
  const data = buildHistory(confidence);
  const topics = Object.keys(confidence) as DSATopic[];

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.07)" />
          <XAxis dataKey="session" tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} />
          <YAxis
            domain={[0, 1]}
            tickFormatter={(v: number) => `${Math.round(v * 100)}%`}
            tick={{ fontSize: 10, fill: '#475569' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              return (
                <div style={{ background: 'rgba(6,14,30,0.95)', border: '1px solid rgba(148,163,184,0.15)', borderRadius: 10, fontSize: 11, color: '#f8fafc', padding: '8px 12px' }}>
                  <p style={{ color: '#94a3b8', marginBottom: 4 }}>{label}</p>
                  {payload.map((p) => (
                    <p key={p.dataKey as string} style={{ color: p.color }}>
                      {topicLabel(p.dataKey as string)}: {Math.round((p.value as number) * 100)}%
                    </p>
                  ))}
                </div>
              );
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: 10, paddingTop: 8 }}
            formatter={(value: string) => (
              <span style={{ color: '#64748b' }}>{topicLabel(value)}</span>
            )}
          />
          {topics.map((t) => (
            <Line
              key={t}
              type="monotone"
              dataKey={t}
              stroke={getConfidenceColor(confidence[t])}
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
