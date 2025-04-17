/*
  # Create Admin User with Enhanced Permissions

  1. Changes
    - Creates a new admin user with secure configuration
    - Sets up enhanced security settings
    - Configures admin-specific preferences
    - Ensures proper role assignment

  2. Security
    - Enables enhanced security features
    - Sets up strict session controls
    - Configures notification preferences
*/

-- Create admin user profile with enhanced permissions
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
)
SELECT 
  id,
  'WILPF Global Administrator',
  'global_admin'::user_role,
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
  ARRAY['Administration', 'Security', 'Compliance', 'User Management'],
  ARRAY['System Administration', 'Security Management', 'Policy Management', 'User Administration']
FROM auth.users
WHERE email = 'admin@wilpf.org'
AND NOT EXISTS (
  SELECT 1 FROM public.profiles WHERE id = auth.users.id
)
ON CONFLICT (id) DO UPDATE
SET 
  role = 'global_admin',
  member_type = 'staff';

-- Configure enhanced security settings for admin
INSERT INTO public.security_settings (
  profile_id,
  two_factor_enabled,
  login_notifications,
  session_timeout_minutes,
  max_sessions
)
SELECT 
  p.id,
  true,
  true,
  180,
  15
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'admin@wilpf.org'
ON CONFLICT (profile_id) DO UPDATE
SET 
  two_factor_enabled = true,
  login_notifications = true;

-- Set up admin preferences
INSERT INTO public.user_preferences (
  profile_id,
  email_notifications,
  meeting_reminders,
  newsletter_subscription,
  language,
  timezone
)
SELECT 
  p.id,
  true,
  true,
  true,
  'en',
  'UTC'
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'admin@wilpf.org'
ON CONFLICT (profile_id) DO UPDATE
SET 
  email_notifications = true,
  meeting_reminders = true;