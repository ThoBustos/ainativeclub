-- Add call schedule to members
ALTER TABLE members
  ADD COLUMN call_schedule JSONB,
  ADD COLUMN call_schedule_start DATE;

-- Create calls table (replaces sessions + transcripts)
CREATE TABLE calls (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id     UUID REFERENCES members(id) ON DELETE CASCADE NOT NULL,
  call_date     DATE NOT NULL,
  raw_text      TEXT,
  summary       TEXT,
  key_learnings JSONB,
  status        TEXT NOT NULL DEFAULT 'processing',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX calls_member_id_idx ON calls(member_id);
CREATE INDEX calls_call_date_idx ON calls(call_date DESC);

-- Create call_skips table
CREATE TABLE call_skips (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id    UUID REFERENCES members(id) ON DELETE CASCADE NOT NULL,
  skipped_date DATE NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(member_id, skipped_date)
);

-- Migrate transcripts → calls
INSERT INTO calls (id, member_id, call_date, raw_text, summary, key_learnings, status, created_at)
SELECT
  id,
  member_id,
  created_at::DATE AS call_date,
  raw_text,
  summary,
  key_learnings,
  CASE WHEN status = 'published' THEN 'published' WHEN status = 'failed' THEN 'failed' ELSE 'processing' END,
  created_at
FROM transcripts;

-- Migrate completed sessions without transcripts → calls (no raw_text)
-- Only sessions that don't already have a transcript
INSERT INTO calls (member_id, call_date, status, created_at)
SELECT
  s.member_id,
  s.completed_at::DATE AS call_date,
  'published' AS status,
  s.completed_at AS created_at
FROM sessions s
WHERE s.completed_at IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM transcripts t WHERE t.session_id = s.id
  );

-- Update goal_suggestions: rename transcript_id → call_id
ALTER TABLE goal_suggestions
  ADD COLUMN call_id UUID REFERENCES calls(id) ON DELETE CASCADE;

UPDATE goal_suggestions gs
SET call_id = gs.transcript_id;

ALTER TABLE goal_suggestions DROP CONSTRAINT goal_suggestions_transcript_id_fkey;
ALTER TABLE goal_suggestions DROP COLUMN transcript_id;
ALTER TABLE goal_suggestions ALTER COLUMN call_id SET NOT NULL;

-- RLS
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_skips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members_read_own_published_calls"
  ON calls FOR SELECT
  USING (
    status = 'published' AND
    member_id = (SELECT id FROM members WHERE user_id = auth.uid())
  );

-- Drop old tables
DROP TABLE IF EXISTS transcripts;
DROP TABLE IF EXISTS sessions;
