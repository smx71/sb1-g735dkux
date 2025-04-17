/*
  # Create Admin Profile Helper Function
  
  1. Changes
    - Creates a function to safely create admin profile
    - Function will be called when admin user is created in auth.users
    - Sets up appropriate security settings
    
  2. Security
    - Only creates profile if auth user exists
    - Maintains referential integrity
    - Sets up proper security settings
*/

-- Function to create admin profile when auth user is created
CREATE OR REPLACE FUNCTION handle_admin_user_profile() 
RETURNS trigger AS $$
BEGIN
  -- Only proceed if the email matches our admin email
  IF NEW.email = 'admin@wilpf.org' THEN
    -- Create the admin profile
    INSERT INTO public.profiles (
      id,
      full_name,
      role,
      member_type,
      account_status,
      administrative_status,
      consent_data,
      key_work_areas,
      expertise_areas
    ) VALUES (
      NEW.id,
      'Global Administrator',
      'global_admin',
      'staff',
      'active',
      jsonb_build_object(
        'dues_paid', true,
        'active_grants', false,
        'reports_submitted', true
      ),
      jsonb_build_object(
        'data_usage', true,
        'newsletter', true
      ),
      ARRAY['Administration', 'Security', 'Compliance'],
      ARRAY['System Administration', 'Security Management', 'User Management']
    )
    ON CONFLICT (id) DO NOTHING;

    -- Create security settings for admin
    INSERT INTO public.security_settings (
      profile_id,
      two_factor_enabled,
      login_notifications,
      session_timeout_minutes,
      max_sessions
    ) VALUES (
      NEW.id,
      true,
      true,
      120,
      10
    )
    ON CONFLICT (profile_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to handle admin user creation
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'handle_new_admin_user'
  ) THEN
    CREATE TRIGGER handle_new_admin_user
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION handle_admin_user_profile();
  END IF;
END $$;