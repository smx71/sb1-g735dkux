/*
  # WILPF Platform Schema

  1. New Tables
    - `zoom_meetings`: For managing online meetings and webinars
    - `meeting_participants`: For tracking meeting attendance
    - `notifications`: For system notifications and reminders
    - `user_preferences`: For user-specific settings
  
  2. Security
    - RLS enabled on all tables
    - Role-based access policies
    - Secure data access patterns

  3. Changes
    - Add new tables for platform functionality
    - Set up security policies
    - Create utility functions
*/

-- Zoom Meetings
CREATE TABLE IF NOT EXISTS zoom_meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  speaker_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  zoom_meeting_id text,
  zoom_join_url text,
  start_time timestamptz NOT NULL,
  duration integer NOT NULL, -- in minutes
  max_participants integer,
  status text DEFAULT 'scheduled',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE zoom_meetings ENABLE ROW LEVEL SECURITY;

-- Meeting Participants
CREATE TABLE IF NOT EXISTS meeting_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id uuid REFERENCES zoom_meetings(id) ON DELETE CASCADE,
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  registration_time timestamptz DEFAULT now(),
  attended boolean DEFAULT false,
  feedback text,
  UNIQUE(meeting_id, profile_id)
);

ALTER TABLE meeting_participants ENABLE ROW LEVEL SECURITY;

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  type text NOT NULL,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- User Preferences
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  email_notifications boolean DEFAULT true,
  meeting_reminders boolean DEFAULT true,
  newsletter_subscription boolean DEFAULT true,
  language text DEFAULT 'en',
  timezone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(profile_id)
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Update profiles table with new fields
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS section_id uuid REFERENCES sections(id),
ADD COLUMN IF NOT EXISTS last_login timestamptz,
ADD COLUMN IF NOT EXISTS account_status text DEFAULT 'active',
ADD COLUMN IF NOT EXISTS zoom_settings jsonb DEFAULT '{"host_privileges": false}'::jsonb;

-- RLS Policies

-- Zoom Meetings
CREATE POLICY "Speakers can manage their meetings"
  ON zoom_meetings
  FOR ALL
  TO authenticated
  USING (speaker_id = auth.uid() OR 
        EXISTS (
          SELECT 1 FROM profiles 
          WHERE id = auth.uid() 
          AND role IN ('section_admin', 'global_admin')
        ));

CREATE POLICY "Users can view published meetings"
  ON zoom_meetings
  FOR SELECT
  TO authenticated
  USING (status = 'published' OR speaker_id = auth.uid());

-- Meeting Participants
CREATE POLICY "Users can manage their own participation"
  ON meeting_participants
  FOR ALL
  TO authenticated
  USING (profile_id = auth.uid());

CREATE POLICY "Speakers can view their meeting participants"
  ON meeting_participants
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM zoom_meetings
      WHERE zoom_meetings.id = meeting_participants.meeting_id
      AND zoom_meetings.speaker_id = auth.uid()
    )
  );

-- Notifications
CREATE POLICY "Users can manage their notifications"
  ON notifications
  FOR ALL
  TO authenticated
  USING (profile_id = auth.uid());

-- User Preferences
CREATE POLICY "Users can manage their preferences"
  ON user_preferences
  FOR ALL
  TO authenticated
  USING (profile_id = auth.uid());

-- Functions

-- Function to create user preferences on profile creation
CREATE OR REPLACE FUNCTION create_user_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_preferences (profile_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create user preferences
CREATE TRIGGER create_user_preferences_trigger
AFTER INSERT ON profiles
FOR EACH ROW
EXECUTE FUNCTION create_user_preferences();

-- Function to send meeting reminder notifications
CREATE OR REPLACE FUNCTION send_meeting_reminders()
RETURNS void AS $$
BEGIN
  INSERT INTO notifications (profile_id, title, content, type)
  SELECT 
    mp.profile_id,
    'Meeting Reminder',
    'Your meeting "' || zm.title || '" starts in 24 hours.',
    'meeting_reminder'
  FROM zoom_meetings zm
  JOIN meeting_participants mp ON mp.meeting_id = zm.id
  WHERE 
    zm.start_time BETWEEN now() + interval '23 hours'
    AND now() + interval '25 hours'
    AND zm.status = 'scheduled';
END;
$$ LANGUAGE plpgsql;