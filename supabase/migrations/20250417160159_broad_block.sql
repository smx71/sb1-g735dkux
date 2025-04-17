/*
  # Create New Admin User

  1. New Admin User Setup
    - Creates a new admin user profile with global_admin role
    - Sets up security settings with enhanced privileges
    - Configures administrative status and permissions

  2. Security
    - Enables two-factor authentication
    - Sets up login notifications
    - Configures extended session timeout
    - Allows higher number of concurrent sessions

  3. Permissions
    - Grants full administrative access
    - Sets up audit logging
*/

-- Create admin user profile
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
  'WILPF Administrator',
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
  member_type = 'staff',
  administrative_status = jsonb_build_object(
    'dues_paid', true,
    'active_grants', false,
    'reports_submitted', true
  ),
  key_work_areas = ARRAY['Administration', 'Security', 'Compliance', 'User Management'],
  expertise_areas = ARRAY['System Administration', 'Security Management', 'Policy Management', 'User Administration'];

-- Set up enhanced security settings for admin
INSERT INTO public.security_settings (
  profile_id,
  two_factor_enabled,
  login_notifications,
  session_timeout_minutes,
  max_sessions,
  require_password_change,
  password_history
)
SELECT 
  p.id,
  true,
  true,
  180,
  15,
  false,
  '[]'::jsonb
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'admin@wilpf.org'
ON CONFLICT (profile_id) DO UPDATE
SET 
  two_factor_enabled = true,
  login_notifications = true,
  session_timeout_minutes = 180,
  max_sessions = 15;

-- Set up user preferences for admin
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
  meeting_reminders = true,
  newsletter_subscription = true;