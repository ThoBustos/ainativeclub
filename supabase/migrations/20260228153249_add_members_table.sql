-- Members table: Links to Supabase auth.users
-- Stores member-specific data and role information

-- Create role enum
CREATE TYPE member_role AS ENUM ('member', 'admin');
CREATE TYPE member_status AS ENUM ('pending', 'active', 'suspended');

-- Members table
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role member_role DEFAULT 'member',
  status member_status DEFAULT 'pending',

  -- Profile data
  avatar_url TEXT,
  linkedin_url TEXT,
  company TEXT,
  bio TEXT,

  -- Linked application (if they applied first)
  application_id UUID REFERENCES applications(id),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  onboarded_at TIMESTAMPTZ
);

-- Index for fast lookups
CREATE INDEX members_user_id_idx ON members(user_id);
CREATE INDEX members_email_idx ON members(email);
CREATE INDEX members_status_idx ON members(status);

-- RLS policies
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- Members can read their own data
CREATE POLICY "Members can view own profile"
  ON members FOR SELECT
  USING (auth.uid() = user_id);

-- Members can update their own profile (limited fields)
CREATE POLICY "Members can update own profile"
  ON members FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins can read all members
CREATE POLICY "Admins can view all members"
  ON members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM members m
      WHERE m.user_id = auth.uid()
      AND m.role = 'admin'
    )
  );

-- Admins can insert members
CREATE POLICY "Admins can insert members"
  ON members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM members m
      WHERE m.user_id = auth.uid()
      AND m.role = 'admin'
    )
  );

-- Admins can update any member
CREATE POLICY "Admins can update members"
  ON members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM members m
      WHERE m.user_id = auth.uid()
      AND m.role = 'admin'
    )
  );

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER members_updated_at
  BEFORE UPDATE ON members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Comment
COMMENT ON TABLE members IS 'Club members linked to auth.users with role-based access';
