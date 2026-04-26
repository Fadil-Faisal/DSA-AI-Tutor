-- Behavior Tracking Tables
-- Run this SQL in Supabase SQL Editor to create the necessary tables

-- 1. Behavior Signals Table - raw signals from client
CREATE TABLE IF NOT EXISTS behavior_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  problem_id TEXT,
  signal_type TEXT NOT NULL,
  value NUMERIC NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_behavior_signals_session ON behavior_signals(session_id);
CREATE INDEX IF NOT EXISTS idx_behavior_signals_created ON behavior_signals(created_at);

-- 2. Agent Predictions Table - AI predictions based on behavior snapshots
CREATE TABLE IF NOT EXISTS agent_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  predicted_state TEXT NOT NULL,
  confidence NUMERIC NOT NULL,
  signals_snapshot JSONB NOT NULL,
  recommendation TEXT,
  explanation TEXT,
  ai_source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_predictions_session ON agent_predictions(session_id);
CREATE INDEX IF NOT EXISTS idx_agent_predictions_created ON agent_predictions(created_at DESC);

-- Enable RLS (optional - can be disabled for testing)
-- ALTER TABLE behavior_signals ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE agent_predictions ENABLE ROW LEVEL SECURITY;