-- Portal schema: leveling, ARR tracking, goals, sessions, feed, chat
-- Phase 0 of AINativeClub portal implementation

-- =============================================================================
-- ALTER MEMBERS: Add portal columns
-- =============================================================================

-- Level + XP (xp_to_next_level is computed from arr_current, not stored)
ALTER TABLE members ADD COLUMN level integer NOT NULL DEFAULT 1;
ALTER TABLE members ADD COLUMN xp_current integer NOT NULL DEFAULT 0;

-- ARR tracking
ALTER TABLE members ADD COLUMN arr_current integer NOT NULL DEFAULT 0;
ALTER TABLE members ADD COLUMN arr_target integer NOT NULL DEFAULT 20000;
ALTER TABLE members ADD COLUMN arr_history jsonb NOT NULL DEFAULT '[]';
-- arr_history shape: [{"date": "2026-03-11", "value": 38000, "note": "Closed 3 contracts"}]

-- Scheduling
ALTER TABLE members ADD COLUMN next_call_at timestamptz;

-- Feature flags (Thomas toggles, not level-gated)
ALTER TABLE members ADD COLUMN features_enabled jsonb NOT NULL DEFAULT
  '{"session_log": false, "insights": false, "playbooks": false, "community": false, "peer_calls": false}';

-- =============================================================================
-- GOALS TABLE
-- =============================================================================

CREATE TABLE goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  title text NOT NULL,
  xp integer NOT NULL DEFAULT 10,       -- Thomas sets per goal (10-60 XP, scales with ARR stage)
  submitted_at timestamptz,             -- set when member marks done; awaits Thomas approval
  completed_at timestamptz,             -- set when Thomas approves; XP granted at this moment
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX goals_member_id_idx ON goals(member_id);
CREATE INDEX goals_completed_at_idx ON goals(completed_at);

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view own goals"
  ON goals FOR SELECT
  USING (
    member_id IN (
      SELECT id FROM members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Members can update own goals"
  ON goals FOR UPDATE
  USING (
    member_id IN (
      SELECT id FROM members WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    member_id IN (
      SELECT id FROM members WHERE user_id = auth.uid()
    )
  );

COMMENT ON TABLE goals IS 'Member goals set by Thomas. Members mark done, Thomas approves.';
COMMENT ON COLUMN goals.submitted_at IS 'When member marked as done — pending Thomas approval';
COMMENT ON COLUMN goals.completed_at IS 'When Thomas approved — XP is granted at this moment';
COMMENT ON COLUMN goals.xp IS 'XP value set by Thomas per goal. Scales with ARR stage: 10-25 (early), 20-40 (mid), 30-60 (scale)';

-- =============================================================================
-- LEVEL EVENTS TABLE
-- =============================================================================

CREATE TYPE level_event_type AS ENUM ('goal_completed', 'call_attended', 'manual_grant', 'arr_update');

CREATE TABLE level_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  event_type level_event_type NOT NULL,
  action text NOT NULL,         -- human-readable label shown in history drawer
  xp integer NOT NULL,
  level_after integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX level_events_member_id_idx ON level_events(member_id);
CREATE INDEX level_events_created_at_idx ON level_events(created_at DESC);

ALTER TABLE level_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view own level events"
  ON level_events FOR SELECT
  USING (
    member_id IN (
      SELECT id FROM members WHERE user_id = auth.uid()
    )
  );

COMMENT ON TABLE level_events IS 'XP event log. Sources: goal_completed (+10-60), call_attended (+25), manual_grant (+10-100), arr_update (+5)';

-- =============================================================================
-- SESSIONS TABLE
-- =============================================================================

CREATE TABLE sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  scheduled_at timestamptz NOT NULL,
  completed_at timestamptz,     -- null = upcoming, set = done
  notes text,                   -- Thomas writes after call
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX sessions_member_id_idx ON sessions(member_id);
CREATE INDEX sessions_scheduled_at_idx ON sessions(scheduled_at DESC);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view own sessions"
  ON sessions FOR SELECT
  USING (
    member_id IN (
      SELECT id FROM members WHERE user_id = auth.uid()
    )
  );

COMMENT ON TABLE sessions IS 'Scheduled and completed calls between Thomas and members';

-- =============================================================================
-- THOMAS FEED TABLE
-- =============================================================================

CREATE TABLE thomas_feed (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  note text NOT NULL,           -- Thomas writes in admin; visible to member in portal
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX thomas_feed_member_id_idx ON thomas_feed(member_id);
CREATE INDEX thomas_feed_created_at_idx ON thomas_feed(created_at DESC);

ALTER TABLE thomas_feed ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view own feed"
  ON thomas_feed FOR SELECT
  USING (
    member_id IN (
      SELECT id FROM members WHERE user_id = auth.uid()
    )
  );

COMMENT ON TABLE thomas_feed IS 'Personal observations from Thomas after sessions. Visible to the member in their portal.';

-- =============================================================================
-- MESSAGES TABLE
-- =============================================================================

CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX messages_member_id_idx ON messages(member_id);
CREATE INDEX messages_created_at_idx ON messages(created_at ASC);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view own messages"
  ON messages FOR SELECT
  USING (
    member_id IN (
      SELECT id FROM members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Members can insert own messages"
  ON messages FOR INSERT
  WITH CHECK (
    member_id IN (
      SELECT id FROM members WHERE user_id = auth.uid()
    )
  );

COMMENT ON TABLE messages IS 'Chat history between member and AI assistant. Persisted per member.';
