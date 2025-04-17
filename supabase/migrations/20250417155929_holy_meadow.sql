/*
  # Update user role to admin

  1. Changes
    - Updates the role of user smx71@msn.com to global_admin
    - Updates related security settings

  2. Security
    - Maintains existing RLS policies
    - Updates security settings for admin access
*/

-- Update the user's role to global_admin
UPDATE profiles
SET 
  role = 'global_admin',
  member_type = 'staff',
  administrative_status = jsonb_build_object(
    'dues_paid', true,
    'active_grants', false,
    'reports_submitted', true
  ),
  key_work_areas = ARRAY['Administration', 'Security', 'Compliance'],
  expertise_areas = ARRAY['System Administration', 'Security Management', 'User Management']
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'smx71@msn.com'
);

-- Update security settings for admin access
UPDATE security_settings
SET 
  two_factor_enabled = true,
  login_notifications = true,
  session_timeout_minutes = 120,
  max_sessions = 10
WHERE profile_id IN (
  SELECT id FROM auth.users WHERE email = 'smx71@msn.com'
);