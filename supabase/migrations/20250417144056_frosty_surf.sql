/*
  # Update Members and Contacts Schema

  1. Updates to Profiles Table
    - Add new fields for member information:
      - address
      - expertise_areas
      - administrative_status
      - consent_data
      - member_type
      - key_work_areas

  2. New Tables
    - contacts: For managing external contacts (donors, partners, etc.)
    - contact_interactions: For tracking interaction history
    - contact_categories: For categorizing contacts
    - contact_relationships: For managing relationships between contacts

  3. Security
    - Enable RLS on new tables
    - Add policies for authenticated users
*/

-- Add new columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS expertise_areas text[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS administrative_status jsonb DEFAULT '{"dues_paid": false, "reports_submitted": false, "active_grants": false}'::jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS consent_data jsonb DEFAULT '{"data_usage": false, "newsletter": false}'::jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS member_type text DEFAULT 'individual';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS key_work_areas text[];

-- Create contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  organization text,
  email text,
  phone text,
  address jsonb,
  contact_type text NOT NULL,
  status text DEFAULT 'active',
  tags text[],
  notes text,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create contact_categories table
CREATE TABLE IF NOT EXISTS contact_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create contact_relationships table
CREATE TABLE IF NOT EXISTS contact_relationships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid REFERENCES contacts(id) ON DELETE CASCADE,
  related_contact_id uuid REFERENCES contacts(id) ON DELETE CASCADE,
  relationship_type text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(contact_id, related_contact_id)
);

-- Create contact_interactions table
CREATE TABLE IF NOT EXISTS contact_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid REFERENCES contacts(id) ON DELETE CASCADE,
  interaction_type text NOT NULL,
  description text NOT NULL,
  date timestamptz NOT NULL,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_interactions ENABLE ROW LEVEL SECURITY;

-- Contacts policies
CREATE POLICY "Authenticated users can view contacts"
  ON contacts FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Staff can manage contacts"
  ON contacts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('section_admin', 'global_admin')
    )
  );

-- Contact categories policies
CREATE POLICY "Contact categories are viewable by authenticated users"
  ON contact_categories FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Staff can manage contact categories"
  ON contact_categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('section_admin', 'global_admin')
    )
  );

-- Contact relationships policies
CREATE POLICY "Contact relationships are viewable by authenticated users"
  ON contact_relationships FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Staff can manage contact relationships"
  ON contact_relationships FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('section_admin', 'global_admin')
    )
  );

-- Contact interactions policies
CREATE POLICY "Contact interactions are viewable by authenticated users"
  ON contact_interactions FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Staff can manage contact interactions"
  ON contact_interactions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('section_admin', 'global_admin')
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contacts_type ON contacts(contact_type);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);
CREATE INDEX IF NOT EXISTS idx_contact_interactions_date ON contact_interactions(date);
CREATE INDEX IF NOT EXISTS idx_contact_interactions_contact ON contact_interactions(contact_id);