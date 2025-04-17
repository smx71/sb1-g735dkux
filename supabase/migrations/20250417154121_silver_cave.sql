/*
  # Enhanced Security Features

  1. New Features
    - Add password policy enforcement
    - Add session management
    - Add IP tracking
    - Add user activity logging

  2. Security
    - Enhanced RLS policies
    - Additional audit logging
    - Session tracking
*/

-- Create sessions tracking table
CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  ip_address text,
  user_agent text,
  last_active timestamptz DEFAULT now(),
  is_valid boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own sessions
CREATE POLICY "Users can view own sessions"
  ON user_sessions
  FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid());

-- Create activity logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  activity_type text NOT NULL,
  description text,
  metadata jsonb,
  ip_address text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own activity
CREATE POLICY "Users can view own activity"
  ON activity_logs
  FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid());

-- Admins can view all activity
CREATE POLICY "Admins can view all activity"
  ON activity_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'global_admin'
    )
  );

-- Add security-related columns to security_settings
ALTER TABLE security_settings
ADD COLUMN IF NOT EXISTS password_last_changed timestamptz,
ADD COLUMN IF NOT EXISTS require_password_change boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS password_history jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS session_timeout_minutes integer DEFAULT 60,
ADD COLUMN IF NOT EXISTS max_sessions integer DEFAULT 5;

-- Function to log user activity
CREATE OR REPLACE FUNCTION log_user_activity()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO activity_logs (
    profile_id,
    activity_type,
    description,
    metadata
  )
  VALUES (
    NEW.profile_id,
    TG_ARGV[0],
    TG_ARGV[1],
    jsonb_build_object(
      'table', TG_TABLE_NAME,
      'operation', TG_OP,
      'record_id', NEW.id
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for activity logging
CREATE TRIGGER log_session_activity
AFTER INSERT ON user_sessions
FOR EACH ROW
EXECUTE FUNCTION log_user_activity('session', 'New session created');

-- Update profiles RLS to include account status check
DROP POLICY IF EXISTS "Users can view active profiles" ON profiles;
CREATE POLICY "Users can view active profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    (account_status = 'active' AND failed_login_attempts < 5) OR
    id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'global_admin'
    )
  );

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  UPDATE user_sessions
  SET is_valid = false
  WHERE last_active < now() - interval '1 hour'
  AND is_valid = true;
END;
$$ LANGUAGE plpgsql;

-- Function to check and enforce session limits
CREATE OR REPLACE FUNCTION enforce_session_limits()
RETURNS TRIGGER AS $$
DECLARE
  session_count integer;
  max_sessions integer;
BEGIN
  -- Get max sessions from security settings
  SELECT ss.max_sessions INTO max_sessions
  FROM security_settings ss
  WHERE ss.profile_id = NEW.profile_id;

  -- Count valid sessions
  SELECT COUNT(*) INTO session_count
  FROM user_sessions
  WHERE profile_id = NEW.profile_id
  AND is_valid = true;

  -- If over limit, invalidate oldest session
  IF session_count > max_sessions THEN
    UPDATE user_sessions
    SET is_valid = false
    WHERE profile_id = NEW.profile_id
    AND id = (
      SELECT id
      FROM user_sessions
      WHERE profile_id = NEW.profile_id
      AND is_valid = true
      ORDER BY last_active ASC
      LIMIT 1
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for session limits
CREATE TRIGGER enforce_session_limits_trigger
AFTER INSERT ON user_sessions
FOR EACH ROW
EXECUTE FUNCTION enforce_session_limits();