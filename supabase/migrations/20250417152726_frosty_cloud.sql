/*
  # Add Speaker Role to User Roles

  1. Changes
    - Safely add 'speaker' to user_role enum if it doesn't exist
    - Uses dynamic SQL to avoid errors if the value already exists

  2. Notes
    - This approach prevents errors when the value already exists
    - Maintains backward compatibility
*/

DO $$ 
BEGIN 
  -- Check if the enum value exists before trying to add it
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_enum 
    WHERE enumlabel = 'speaker' 
    AND enumtypid = (
      SELECT oid 
      FROM pg_type 
      WHERE typname = 'user_role'
    )
  ) THEN
    -- Add the new enum value only if it doesn't exist
    ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'speaker';
  END IF;
END $$;