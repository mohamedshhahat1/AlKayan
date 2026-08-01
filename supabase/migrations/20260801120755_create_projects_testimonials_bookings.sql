/*
# Create tables for الكيان construction website

1. New Tables
- `projects` — portfolio projects (apartments, villas, offices, etc.) with gallery, before/after, details
- `testimonials` — client reviews with 5-star ratings
- `bookings` — free consultation booking form submissions
- `partners` — partner/supplier logos for the auto-scroll section
2. Security
- Enable RLS on all tables.
- Projects, testimonials, and partners are intentionally public (no auth) → anon + authenticated SELECT.
- Bookings: anon + authenticated INSERT (anyone can book), no SELECT/UPDATE/DELETE for anon (private submissions).
*/

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  title_en text,
  category text NOT NULL,
  location text,
  area_sqm numeric,
  duration_days integer,
  execution_date date,
  services_included text[],
  materials_used text[],
  client_testimonial text,
  client_name text,
  video_url text,
  hero_image text NOT NULL,
  gallery_images text[],
  before_image text,
  after_image text,
  featured boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_projects" ON projects;
CREATE POLICY "anon_select_projects" ON projects FOR SELECT
  TO anon, authenticated USING (true);

-- Testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name text NOT NULL,
  client_title text,
  rating integer NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  content text NOT NULL,
  avatar_url text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_testimonials" ON testimonials;
CREATE POLICY "anon_select_testimonials" ON testimonials FOR SELECT
  TO anon, authenticated USING (true);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  service_type text,
  preferred_date date,
  message text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_bookings" ON bookings;
CREATE POLICY "anon_insert_bookings" ON bookings FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- Partners table
CREATE TABLE IF NOT EXISTS partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  logo_url text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE partners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_partners" ON partners;
CREATE POLICY "anon_select_partners" ON partners FOR SELECT
  TO anon, authenticated USING (true);
