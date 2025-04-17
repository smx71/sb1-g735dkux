/*
  # Enhanced Security Policies

  1. Security Updates
    - Strengthen RLS policies for all tables
    - Add role-based access control
    - Improve data protection
    - Add audit logging

  2. New Tables
    - `audit_logs` for tracking important actions
    - `security_settings` for user security preferences

  3. Changes
    - Add security-related columns to existing tables
    - Update RLS policies
*/

-- Create audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  action text NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  old_data jsonb,
  new_data jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('global_admin', 'section_admin')
    )
  );

-- Create security settings table
CREATE TABLE IF NOT EXISTS security_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  two_factor_enabled boolean DEFAULT false,
  login_notifications boolean DEFAULT true,
  allowed_ips text[],
  last_security_update timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE security_settings ENABLE ROW LEVEL SECURITY;

-- Users can only view and edit their own security settings
CREATE POLICY "Users can manage their security settings"
  ON security_settings
  FOR ALL
  TO authenticated
  USING (profile_id = auth.uid());

-- Update profiles table with security-related columns
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS last_password_change timestamptz,
ADD COLUMN IF NOT EXISTS failed_login_attempts integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS account_locked_until timestamptz;

-- Strengthen existing RLS policies

-- Profiles
CREATE POLICY "Users can view active profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    account_status = 'active' OR
    id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('global_admin', 'section_admin')
    )
  );

-- Sections
CREATE POLICY "Section visibility control"
  ON sections
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (
        profiles.section_id = sections.id OR
        profiles.role IN ('global_admin', 'section_admin')
      )
    )
  );

-- Posts
CREATE POLICY "Post access control"
  ON posts
  FOR SELECT
  TO authenticated
  USING (
    status = 'published' OR
    author_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('global_admin', 'section_admin')
    )
  );

-- Events
CREATE POLICY "Event access control"
  ON events
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (
        profiles.section_id = events.section_id OR
        profiles.role IN ('global_admin', 'section_admin')
      )
    )
  );

-- Resources
CREATE POLICY "Resource access control"
  ON resources
  FOR SELECT
  TO authenticated
  USING (
    is_public = true OR
    uploaded_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('global_admin', 'section_admin')
    )
  );

-- Function to create security settings on profile creation
CREATE OR REPLACE FUNCTION create_security_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO security_settings (profile_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create security settings
CREATE TRIGGER create_security_settings_trigger
AFTER INSERT ON profiles
FOR EACH ROW
EXECUTE FUNCTION create_security_settings();

-- Function to log profile changes
CREATE OR REPLACE FUNCTION log_profile_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (
      profile_id,
      action,
      table_name,
      record_id,
      old_data,
      new_data
    )
    VALUES (
      auth.uid(),
      TG_OP,
      TG_TABLE_NAME,
      NEW.id,
      row_to_json(OLD),
      row_to_json(NEW)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to log profile changes
CREATE TRIGGER log_profile_changes_trigger
AFTER UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION log_profile_changes();