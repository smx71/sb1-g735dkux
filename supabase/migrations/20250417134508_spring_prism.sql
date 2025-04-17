/*
  # Initial WILPF Platform Schema

  1. New Tables
    - `profiles`: Extended user information linked to auth.users
    - `sections`: Regional/national WILPF sections
    - `memberships`: User membership information
    - `posts`: Blog posts and news articles
    - `events`: WILPF events and activities
    - `forum_topics`: Discussion forum topics
    - `forum_posts`: Forum discussion posts
    - `messages`: Internal messaging system
    - `resources`: Educational and organizational resources
    - `donations`: Donation records

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Add policies for admin roles
    - Add policies for public access where needed

  3. Relationships
    - profiles -> auth.users (one-to-one)
    - memberships -> profiles (many-to-one)
    - memberships -> sections (many-to-one)
    - posts -> profiles (many-to-one)
    - events -> sections (many-to-one)
    - forum_posts -> forum_topics (many-to-one)
    - forum_posts -> profiles (many-to-one)
    - messages -> profiles (many-to-many)
*/

-- Create custom types
CREATE TYPE user_role AS ENUM ('member', 'section_admin', 'global_admin');
CREATE TYPE membership_status AS ENUM ('pending', 'active', 'expired');
CREATE TYPE post_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE event_type AS ENUM ('meeting', 'workshop', 'conference', 'protest', 'other');

-- Profiles table for extended user information
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  bio text,
  avatar_url text,
  role user_role DEFAULT 'member',
  phone text,
  country text,
  language text[] DEFAULT ARRAY['en'],
  notifications_enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Sections table for WILPF national/regional sections
CREATE TABLE IF NOT EXISTS sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  country text NOT NULL,
  description text,
  contact_email text,
  website_url text,
  social_media jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Memberships table
CREATE TABLE IF NOT EXISTS memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  section_id uuid REFERENCES sections(id) ON DELETE CASCADE,
  status membership_status DEFAULT 'pending',
  start_date date DEFAULT CURRENT_DATE,
  end_date date,
  membership_number text UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Posts table for blog posts and news
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content text NOT NULL,
  status post_status DEFAULT 'draft',
  featured_image text,
  tags text[],
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id uuid REFERENCES sections(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  event_type event_type DEFAULT 'other',
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  location jsonb,
  max_participants integer,
  registration_required boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Forum topics table
CREATE TABLE IF NOT EXISTS forum_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  is_pinned boolean DEFAULT false,
  is_locked boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Forum posts table
CREATE TABLE IF NOT EXISTS forum_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id uuid REFERENCES forum_topics(id) ON DELETE CASCADE,
  author_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  content text NOT NULL,
  is_solution boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  recipient_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  subject text,
  content text NOT NULL,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Resources table
CREATE TABLE IF NOT EXISTS resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  file_url text,
  resource_type text NOT NULL,
  tags text[],
  uploaded_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Donations table
CREATE TABLE IF NOT EXISTS donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  amount decimal NOT NULL,
  currency text DEFAULT 'USD',
  status text DEFAULT 'pending',
  payment_intent_id text UNIQUE,
  is_anonymous boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Sections policies
CREATE POLICY "Sections are viewable by everyone"
  ON sections FOR SELECT
  USING (true);

CREATE POLICY "Only admins can modify sections"
  ON sections FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('section_admin', 'global_admin')
    )
  );

-- Memberships policies
CREATE POLICY "Users can view own memberships"
  ON memberships FOR SELECT
  USING (auth.uid() = profile_id);

CREATE POLICY "Section admins can view section memberships"
  ON memberships FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('section_admin', 'global_admin')
    )
  );

-- Posts policies
CREATE POLICY "Published posts are viewable by everyone"
  ON posts FOR SELECT
  USING (status = 'published');

CREATE POLICY "Authors can manage own posts"
  ON posts FOR ALL
  USING (author_id = auth.uid());

-- Events policies
CREATE POLICY "Events are viewable by everyone"
  ON events FOR SELECT
  USING (true);

-- Forum policies
CREATE POLICY "Forum topics are viewable by authenticated users"
  ON forum_topics FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Forum posts are viewable by authenticated users"
  ON forum_posts FOR SELECT
  USING (auth.role() = 'authenticated');

-- Messages policies
CREATE POLICY "Users can manage own messages"
  ON messages FOR ALL
  USING (auth.uid() IN (sender_id, recipient_id));

-- Resources policies
CREATE POLICY "Public resources are viewable by everyone"
  ON resources FOR SELECT
  USING (is_public = true);

CREATE POLICY "Private resources are viewable by authenticated users"
  ON resources FOR SELECT
  USING (auth.role() = 'authenticated');

-- Donations policies
CREATE POLICY "Users can view own donations"
  ON donations FOR SELECT
  USING (donor_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts(published_at);
CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time);
CREATE INDEX IF NOT EXISTS idx_memberships_status ON memberships(status);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id, read_at);
CREATE INDEX IF NOT EXISTS idx_forum_posts_topic ON forum_posts(topic_id);