-- Create admin user if not exists
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
  'Administrator',
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
  ARRAY['Administration', 'Security', 'Compliance'],
  ARRAY['System Administration', 'Security Management', 'User Management']
FROM auth.users
WHERE email = 'smx71@msn.com'
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
  key_work_areas = ARRAY['Administration', 'Security', 'Compliance'],
  expertise_areas = ARRAY['System Administration', 'Security Management', 'User Management'];

-- Update security settings for admin
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
  120,
  10
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'smx71@msn.com'
ON CONFLICT (profile_id) DO UPDATE
SET 
  two_factor_enabled = true,
  login_notifications = true,
  session_timeout_minutes = 120,
  max_sessions = 10;