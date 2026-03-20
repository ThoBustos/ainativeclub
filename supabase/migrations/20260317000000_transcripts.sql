-- Transcripts: one per call, standalone or linked to a session
CREATE TABLE transcripts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id    UUID REFERENCES sessions(id) ON DELETE SET NULL,
  member_id     UUID REFERENCES members(id) ON DELETE CASCADE NOT NULL,
  raw_text      TEXT NOT NULL,
  summary       TEXT,
  key_learnings JSONB,   -- string[] — plain list, no categories
  status        TEXT NOT NULL DEFAULT 'draft',   -- draft | published
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Goal suggestions: AI-generated from transcript, Thomas approves before they become real goals
CREATE TABLE goal_suggestions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transcript_id UUID REFERENCES transcripts(id) ON DELETE CASCADE NOT NULL,
  member_id     UUID REFERENCES members(id) ON DELETE CASCADE NOT NULL,
  title         TEXT NOT NULL,
  xp            INTEGER NOT NULL,
  status        TEXT NOT NULL DEFAULT 'pending',   -- pending | accepted | rejected
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_suggestions ENABLE ROW LEVEL SECURITY;

-- Members can only read their own published transcripts
CREATE POLICY "members_read_own_published_transcripts"
  ON transcripts FOR SELECT
  USING (
    status = 'published' AND
    member_id = (SELECT id FROM members WHERE user_id = auth.uid())
  );

-- Goal suggestions are admin-only (accessed via service role in all server code)
-- No member-facing policy needed — accepted suggestions become goals
