/*
  # Check and setup user profile
  
  1. Checks for existing user profile
  2. Creates profile if missing
  3. Sets up security settings
*/

-- Create profile if it doesn't exist
INSERT INTO public.profiles (
  id,
  full_name,
  role,
  member_type,
  account_status,
  administrative_status,
  consent_data
)
SELECT 
  id,
  email as full_name,
  'member'::user_role,
  'individual',
  'active',
  jsonb_build_object(
    'dues_paid', false,
    'active_grants', false,
    'reports_submitted', false
  ),
  jsonb_build_object(
    'data_usage', true,
    'newsletter', false
  )
FROM auth.users
WHERE email = 'smx71@msn.com'
AND NOT EXISTS (
  SELECT 1 FROM public.profiles WHERE id = auth.users.id
)
ON CONFLICT (id) DO NOTHING;

-- Ensure security settings exist
INSERT INTO public.security_settings (
  profile_id,
  two_factor_enabled,
  login_notifications
)
SELECT 
  p.id,
  false,
  true
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'smx71@msn.com'
AND NOT EXISTS (
  SELECT 1 FROM public.security_settings WHERE profile_id = p.id
)
ON CONFLICT (profile_id) DO NOTHING;