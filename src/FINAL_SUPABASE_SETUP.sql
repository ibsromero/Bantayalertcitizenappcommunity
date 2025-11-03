-- ============================================================================
-- BANTAYALERT - FINAL COMPLETE SUPABASE SETUP
-- ============================================================================
-- This script sets up EVERYTHING needed for BantayAlert to work 100%
-- Run this ONCE in Supabase SQL Editor
-- ============================================================================

-- STEP 1: Drop existing tables (clean slate)
-- ============================================================================
DROP TABLE IF EXISTS public.user_activity_log CASCADE;
DROP TABLE IF EXISTS public.sos_alerts CASCADE;
DROP TABLE IF EXISTS public.emergency_kit_items CASCADE;
DROP TABLE IF EXISTS public.preparation_checklists CASCADE;
DROP TABLE IF EXISTS public.emergency_contacts CASCADE;
DROP TABLE IF EXISTS public.hospitals CASCADE;
DROP TABLE IF EXISTS public.evacuation_centers CASCADE;
DROP TABLE IF EXISTS public.disasters CASCADE;
DROP TABLE IF EXISTS public.kv_store CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE;

-- STEP 2: Create all tables
-- ============================================================================

-- User Profiles
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  phone_number TEXT,
  address TEXT,
  city TEXT DEFAULT 'Metro Manila',
  barangay TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Emergency Contacts
CREATE TABLE public.emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Preparation Checklists
CREATE TABLE public.preparation_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  disaster_type TEXT NOT NULL,
  checklist_data JSONB NOT NULL DEFAULT '{}',
  progress INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Emergency Kit Items
CREATE TABLE public.emergency_kit_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  item_name TEXT NOT NULL,
  quantity TEXT,
  status TEXT DEFAULT 'missing',
  priority TEXT DEFAULT 'medium',
  per_person BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SOS Alerts (CRITICAL FOR REAL-TIME)
CREATE TABLE public.sos_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  location_address TEXT DEFAULT 'Location not provided',
  details TEXT NOT NULL,
  priority TEXT DEFAULT 'high',
  status TEXT DEFAULT 'active',
  responded_by TEXT,
  responded_at TIMESTAMPTZ,
  resolution TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disasters
CREATE TABLE public.disasters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  disaster_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  location TEXT NOT NULL,
  affected_areas TEXT[],
  casualties INTEGER DEFAULT 0,
  injuries INTEGER DEFAULT 0,
  missing INTEGER DEFAULT 0,
  families_affected INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hospitals
CREATE TABLE public.hospitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  total_beds INTEGER DEFAULT 0,
  available_beds INTEGER DEFAULT 0,
  icu_beds INTEGER DEFAULT 0,
  icu_available INTEGER DEFAULT 0,
  emergency_beds INTEGER DEFAULT 0,
  emergency_available INTEGER DEFAULT 0,
  specialties TEXT[],
  status TEXT DEFAULT 'operational',
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Evacuation Centers
CREATE TABLE public.evacuation_centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  barangay TEXT NOT NULL,
  city TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  capacity INTEGER DEFAULT 0,
  current_occupancy INTEGER DEFAULT 0,
  facilities TEXT[],
  contact_number TEXT,
  status TEXT DEFAULT 'operational',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Key-Value Store
CREATE TABLE public.kv_store (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Activity Log
CREATE TABLE public.user_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 3: Create Indexes for Performance
-- ============================================================================
CREATE INDEX idx_emergency_contacts_user_id ON public.emergency_contacts(user_id);
CREATE INDEX idx_sos_alerts_user_id ON public.sos_alerts(user_id);
CREATE INDEX idx_sos_alerts_status ON public.sos_alerts(status);
CREATE INDEX idx_sos_alerts_created_at ON public.sos_alerts(created_at DESC);
CREATE INDEX idx_sos_alerts_priority ON public.sos_alerts(priority);
CREATE INDEX idx_disasters_status ON public.disasters(status);
CREATE INDEX idx_hospitals_city ON public.hospitals(city);
CREATE INDEX idx_user_activity_log_user_id ON public.user_activity_log(user_id);
CREATE INDEX idx_user_activity_log_created_at ON public.user_activity_log(created_at DESC);

-- STEP 4: Enable Row Level Security (RLS)
-- ============================================================================
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preparation_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_kit_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sos_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disasters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evacuation_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kv_store ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_log ENABLE ROW LEVEL SECURITY;

-- STEP 5: Create RLS Policies
-- ============================================================================

-- User Profiles: Users can only see/edit their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;

CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Emergency Contacts: Users manage their own contacts
DROP POLICY IF EXISTS "Users can view own contacts" ON public.emergency_contacts;
DROP POLICY IF EXISTS "Users can insert own contacts" ON public.emergency_contacts;
DROP POLICY IF EXISTS "Users can update own contacts" ON public.emergency_contacts;
DROP POLICY IF EXISTS "Users can delete own contacts" ON public.emergency_contacts;

CREATE POLICY "Users can view own contacts" ON public.emergency_contacts
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Users can insert own contacts" ON public.emergency_contacts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "Users can update own contacts" ON public.emergency_contacts
  FOR UPDATE USING (auth.uid() = user_id);
  
CREATE POLICY "Users can delete own contacts" ON public.emergency_contacts
  FOR DELETE USING (auth.uid() = user_id);

-- SOS Alerts: PUBLIC READ (critical for department dashboard)
DROP POLICY IF EXISTS "Anyone can view SOS alerts" ON public.sos_alerts;
DROP POLICY IF EXISTS "Anyone can insert SOS alerts" ON public.sos_alerts;
DROP POLICY IF EXISTS "Anyone can update SOS alerts" ON public.sos_alerts;

CREATE POLICY "Anyone can view SOS alerts" ON public.sos_alerts
  FOR SELECT USING (true);
  
CREATE POLICY "Anyone can insert SOS alerts" ON public.sos_alerts
  FOR INSERT WITH CHECK (true);
  
CREATE POLICY "Anyone can update SOS alerts" ON public.sos_alerts
  FOR UPDATE USING (true);

-- Disasters: PUBLIC READ
DROP POLICY IF EXISTS "Anyone can view disasters" ON public.disasters;
DROP POLICY IF EXISTS "Anyone can insert disasters" ON public.disasters;
DROP POLICY IF EXISTS "Anyone can update disasters" ON public.disasters;

CREATE POLICY "Anyone can view disasters" ON public.disasters
  FOR SELECT USING (true);
  
CREATE POLICY "Anyone can insert disasters" ON public.disasters
  FOR INSERT WITH CHECK (true);
  
CREATE POLICY "Anyone can update disasters" ON public.disasters
  FOR UPDATE USING (true);

-- Hospitals: PUBLIC READ/WRITE
DROP POLICY IF EXISTS "Anyone can view hospitals" ON public.hospitals;
DROP POLICY IF EXISTS "Anyone can update hospitals" ON public.hospitals;

CREATE POLICY "Anyone can view hospitals" ON public.hospitals
  FOR SELECT USING (true);
  
CREATE POLICY "Anyone can update hospitals" ON public.hospitals
  FOR UPDATE USING (true);

-- Evacuation Centers: PUBLIC READ
DROP POLICY IF EXISTS "Anyone can view evacuation centers" ON public.evacuation_centers;

CREATE POLICY "Anyone can view evacuation centers" ON public.evacuation_centers
  FOR SELECT USING (true);

-- User Activity: Users view own activity
DROP POLICY IF EXISTS "Users can view own activity" ON public.user_activity_log;
DROP POLICY IF EXISTS "Users can insert own activity" ON public.user_activity_log;

CREATE POLICY "Users can view own activity" ON public.user_activity_log
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
  
CREATE POLICY "Users can insert own activity" ON public.user_activity_log
  FOR INSERT WITH CHECK (true);

-- KV Store: PUBLIC READ/WRITE
DROP POLICY IF EXISTS "Anyone can access kv_store" ON public.kv_store;

CREATE POLICY "Anyone can access kv_store" ON public.kv_store
  FOR ALL USING (true);

-- Preparation Checklists & Emergency Kit: Users manage their own
DROP POLICY IF EXISTS "Users manage own checklists" ON public.preparation_checklists;
DROP POLICY IF EXISTS "Users manage own kit items" ON public.emergency_kit_items;

CREATE POLICY "Users manage own checklists" ON public.preparation_checklists
  FOR ALL USING (auth.uid() = user_id);
  
CREATE POLICY "Users manage own kit items" ON public.emergency_kit_items
  FOR ALL USING (auth.uid() = user_id);

-- STEP 6: Enable Realtime for ALL Tables
-- ============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.sos_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.disasters;
ALTER PUBLICATION supabase_realtime ADD TABLE public.hospitals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.evacuation_centers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.emergency_contacts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.preparation_checklists;
ALTER PUBLICATION supabase_realtime ADD TABLE public.emergency_kit_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_activity_log;
ALTER PUBLICATION supabase_realtime ADD TABLE public.kv_store;

-- STEP 7: Insert Sample Data
-- ============================================================================

-- Sample Hospitals (8 Real NCR Hospitals)
INSERT INTO public.hospitals (name, address, city, contact_number, latitude, longitude, total_beds, available_beds, icu_beds, icu_available, emergency_beds, emergency_available, specialties, status) VALUES
('Philippine General Hospital', 'Taft Avenue, Ermita, Manila', 'Manila', '(02) 8554-8400', 14.5796, 120.9864, 1500, 120, 50, 8, 100, 15, ARRAY['Emergency Medicine', 'Cardiology', 'Trauma'], 'operational'),
('Makati Medical Center', '2 Amorsolo Street, Legaspi Village, Makati', 'Makati', '(02) 8888-8999', 14.5547, 121.0244, 600, 45, 30, 5, 50, 10, ARRAY['Cardiology', 'Oncology', 'Neurology'], 'operational'),
('St. Lukes Medical Center - BGC', '7th Ave cor. Rizal Drive, BGC, Taguig', 'Taguig', '(02) 7789-7700', 14.5507, 121.0494, 650, 55, 35, 7, 60, 12, ARRAY['Cardiology', 'Oncology', 'Pediatrics'], 'operational'),
('The Medical City', 'Ortigas Avenue, Pasig', 'Pasig', '(02) 8988-1000', 14.5858, 121.0639, 500, 40, 25, 4, 45, 9, ARRAY['Internal Medicine', 'Surgery', 'Pediatrics'], 'operational'),
('Veterans Memorial Medical Center', 'North Avenue, Diliman, Quezon City', 'Quezon City', '(02) 8927-0001', 14.6545, 121.0494, 1000, 80, 40, 6, 80, 14, ARRAY['General Surgery', 'Internal Medicine'], 'operational'),
('East Avenue Medical Center', 'East Avenue, Diliman, Quezon City', 'Quezon City', '(02) 8928-0611', 14.6417, 121.0509, 800, 65, 35, 6, 70, 13, ARRAY['Emergency Medicine', 'Orthopedics'], 'operational'),
('Chinese General Hospital', '286 Blumentritt Road, Santa Cruz, Manila', 'Manila', '(02) 8711-4141', 14.6102, 120.9833, 400, 35, 20, 3, 40, 8, ARRAY['General Medicine', 'Surgery'], 'operational'),
('Asian Hospital and Medical Center', '2205 Civic Drive, Filinvest Corporate City, Alabang, Muntinlupa', 'Muntinlupa', '(02) 8771-9000', 14.4292, 121.0417, 350, 30, 18, 3, 35, 7, ARRAY['Cardiology', 'Neurology'], 'operational');

-- Sample Evacuation Centers (5 Real NCR Centers)
INSERT INTO public.evacuation_centers (name, address, barangay, city, latitude, longitude, capacity, current_occupancy, facilities, contact_number, status) VALUES
('Rizal Memorial Sports Complex', 'Pablo Ocampo Sr. Avenue, Malate', 'Malate', 'Manila', 14.5705, 120.9933, 5000, 0, ARRAY['Restrooms', 'Medical station', 'Kitchen', 'Sleeping area'], '(02) 8522-4371', 'operational'),
('Quezon City Memorial Circle', 'Elliptical Road, Diliman', 'Diliman', 'Quezon City', 14.6540, 121.0493, 3000, 0, ARRAY['Open space', 'Restrooms', 'First aid'], '(02) 8988-4242', 'operational'),
('Marikina Sports Center', 'Sumulong Highway, Marikina', 'Sto. Niño', 'Marikina', 14.6507, 121.1029, 4000, 0, ARRAY['Indoor gym', 'Restrooms', 'Medical station', 'Kitchen'], '(02) 8646-1734', 'operational'),
('Pasig City Sports Center', 'Caruncho Avenue, Pasig', 'San Joaquin', 'Pasig', 14.5625, 121.0858, 2500, 0, ARRAY['Gym', 'Restrooms', 'Medical area'], '(02) 8643-0222', 'operational'),
('Valenzuela City Astrodome', 'McArthur Highway, Karuhatan', 'Karuhatan', 'Valenzuela', 14.7000, 120.9667, 3500, 0, ARRAY['Indoor dome', 'Restrooms', 'Kitchen', 'Medical station'], '(02) 8292-1345', 'operational');

-- Sample Disasters (for testing)
INSERT INTO public.disasters (disaster_type, severity, location, affected_areas, casualties, injuries, missing, families_affected, status, description) VALUES
('Flood', 'High', 'Marikina River Valley', ARRAY['Marikina', 'Pasig', 'Quezon City'], 2, 15, 3, 450, 'active', 'Heavy rainfall caused Marikina River to overflow. Multiple barangays affected.'),
('Earthquake', 'Medium', 'West Valley Fault', ARRAY['Manila', 'Quezon City', 'Makati'], 0, 8, 0, 120, 'monitoring', 'Magnitude 5.2 earthquake felt across NCR. Monitoring for aftershocks.');

-- STEP 8: Grant Permissions
-- ============================================================================
GRANT ALL ON public.user_profiles TO anon, authenticated;
GRANT ALL ON public.emergency_contacts TO anon, authenticated;
GRANT ALL ON public.preparation_checklists TO anon, authenticated;
GRANT ALL ON public.emergency_kit_items TO anon, authenticated;
GRANT ALL ON public.sos_alerts TO anon, authenticated;
GRANT ALL ON public.disasters TO anon, authenticated;
GRANT ALL ON public.hospitals TO anon, authenticated;
GRANT ALL ON public.evacuation_centers TO anon, authenticated;
GRANT ALL ON public.kv_store TO anon, authenticated;
GRANT ALL ON public.user_activity_log TO anon, authenticated;

-- ============================================================================
-- SETUP COMPLETE!
-- ============================================================================
-- 
-- VERIFICATION QUERIES:
-- 
-- 1. Check all tables exist:
--    SELECT table_name FROM information_schema.tables 
--    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
--    ORDER BY table_name;
--
-- 2. Check realtime enabled:
--    SELECT tablename FROM pg_publication_tables 
--    WHERE pubname = 'supabase_realtime';
--
-- 3. Check sample data:
--    SELECT COUNT(*) FROM hospitals;
--    SELECT COUNT(*) FROM evacuation_centers;
--    SELECT COUNT(*) FROM disasters;
--
-- 4. Test SOS alert insertion:
--    INSERT INTO sos_alerts (user_email, user_name, contact_number, details)
--    VALUES ('test@test.com', 'Test User', '09171234567', 'Test alert');
--
--    SELECT * FROM sos_alerts ORDER BY created_at DESC LIMIT 5;
--
-- ============================================================================
