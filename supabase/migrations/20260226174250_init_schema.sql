-- AI Native Club Initial Schema
-- Tables: applications, waitlist
-- RLS: Public insert only (no read/update/delete from anon)

-- =============================================================================
-- APPLICATIONS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  -- Contact info
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,

  -- Company info
  building TEXT NOT NULL,
  website TEXT NOT NULL,
  github TEXT,
  linkedin TEXT,

  -- Qualification
  role TEXT NOT NULL,
  arr TEXT NOT NULL,
  pain_points TEXT NOT NULL,

  -- Status tracking
  status TEXT DEFAULT 'pending' NOT NULL,

  -- Constraints
  CONSTRAINT applications_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT applications_status_check CHECK (status IN ('pending', 'reviewing', 'accepted', 'rejected'))
);

-- Index for admin queries
CREATE INDEX IF NOT EXISTS applications_status_idx ON public.applications(status);
CREATE INDEX IF NOT EXISTS applications_created_at_idx ON public.applications(created_at DESC);

-- =============================================================================
-- WAITLIST TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  email TEXT NOT NULL UNIQUE,

  -- Constraints
  CONSTRAINT waitlist_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Index for lookups
CREATE INDEX IF NOT EXISTS waitlist_email_idx ON public.waitlist(email);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

-- Enable RLS on both tables
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Applications: Allow anonymous inserts only
-- No one can read/update/delete without service_role key
CREATE POLICY "applications_insert_policy"
  ON public.applications
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Waitlist: Allow anonymous inserts only
CREATE POLICY "waitlist_insert_policy"
  ON public.waitlist
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Auto-update updated_at on row modification
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- COMMENTS
-- =============================================================================
COMMENT ON TABLE public.applications IS 'Founder applications for AI Native Club membership';
COMMENT ON TABLE public.waitlist IS 'Email waitlist for AI Native Club launch';

COMMENT ON COLUMN public.applications.status IS 'Application status: pending, reviewing, accepted, rejected';
COMMENT ON COLUMN public.applications.arr IS 'Annual Recurring Revenue range';
COMMENT ON COLUMN public.applications.pain_points IS 'Main challenges the founder is facing';
