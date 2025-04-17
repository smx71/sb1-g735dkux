/*
  # Add notifications and user preferences

  1. New Tables
    - notifications: Store user notifications
    - user_preferences: Store user preferences
  
  2. Changes
    - Add notification triggers
    - Add user preferences defaults
    
  3. Security
    - Enable RLS
    - Add access policies with existence checks
*/

-- Create notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  type text NOT NULL,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS if not already enabled
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists and create new one
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can manage their notifications" ON notifications;
  
  CREATE POLICY "Users can manage their notifications"
    ON notifications
    FOR ALL
    TO authenticated
    USING (profile_id = auth.uid());
END $$;

-- Create user preferences table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  email_notifications boolean DEFAULT true,
  meeting_reminders boolean DEFAULT true,
  newsletter_subscription boolean DEFAULT true,
  language text DEFAULT 'en',
  timezone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS if not already enabled
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists and create new one
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can manage their preferences" ON user_preferences;
  
  CREATE POLICY "Users can manage their preferences"
    ON user_preferences
    FOR ALL
    TO authenticated
    USING (profile_id = auth.uid());
END $$;

-- Drop existing function if it exists and create new one
DROP FUNCTION IF EXISTS create_user_preferences CASCADE;

CREATE OR REPLACE FUNCTION create_user_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_preferences (profile_id)
  VALUES (NEW.id)
  ON CONFLICT (profile_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists and create new one
DROP TRIGGER IF EXISTS create_user_preferences_trigger ON profiles;

CREATE TRIGGER create_user_preferences_trigger
AFTER INSERT ON profiles
FOR EACH ROW
EXECUTE FUNCTION create_user_preferences();

-- Drop existing function if it exists and create new one
DROP FUNCTION IF EXISTS notify_event_creation CASCADE;

CREATE OR REPLACE FUNCTION notify_event_creation()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (
    profile_id,
    title,
    content,
    type
  )
  SELECT 
    p.id,
    'New Event: ' || NEW.title,
    'A new event has been scheduled: ' || NEW.title,
    'event'
  FROM profiles p
  JOIN user_preferences up ON up.profile_id = p.id
  WHERE up.email_notifications = true;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists and create new one
DROP TRIGGER IF EXISTS notify_new_event ON events;

CREATE TRIGGER notify_new_event
AFTER INSERT ON events
FOR EACH ROW
EXECUTE FUNCTION notify_event_creation();