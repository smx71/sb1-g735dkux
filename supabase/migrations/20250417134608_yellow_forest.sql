/*
  # Add Newsletter Subscribers Table

  1. New Tables
    - `newsletter_subscribers`: Store newsletter subscription information
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `subscribed_at` (timestamptz)
      - `status` (text)
      - `preferences` (jsonb)

  2. Security
    - Enable RLS
    - Add policies for admin access
    - Add policy for subscription management

  3. Changes
    - Add new table for newsletter management
    - Add appropriate indexes for performance
*/

-- Create newsletter_subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  subscribed_at timestamptz DEFAULT now(),
  status text DEFAULT 'active',
  preferences jsonb DEFAULT '{"general": true}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can manage newsletter subscribers"
  ON newsletter_subscribers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'global_admin'
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_status ON newsletter_subscribers(status);