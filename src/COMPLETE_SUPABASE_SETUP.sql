-- ============================================
-- BantayAlert Complete Supabase Setup
-- Run this in your Supabase SQL Editor
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ============================================
-- 1. USER PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  phone_number TEXT,
  address TEXT,
  barangay TEXT,
  city TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 2. EMERGENCY CONTACTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  contact_type TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for emergency_contacts
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own contacts" ON emergency_contacts;
CREATE POLICY "Users can view own contacts" ON emergency_contacts
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own contacts" ON emergency_contacts;
CREATE POLICY "Users can insert own contacts" ON emergency_contacts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own contacts" ON emergency_contacts;
CREATE POLICY "Users can update own contacts" ON emergency_contacts
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own contacts" ON emergency_contacts;
CREATE POLICY "Users can delete own contacts" ON emergency_contacts
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 3. PREPARATION CHECKLISTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS preparation_checklists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  disaster_type TEXT NOT NULL,
  checklist_name TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  progress INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for preparation_checklists
ALTER TABLE preparation_checklists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own checklists" ON preparation_checklists;
CREATE POLICY "Users can view own checklists" ON preparation_checklists
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own checklists" ON preparation_checklists;
CREATE POLICY "Users can insert own checklists" ON preparation_checklists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own checklists" ON preparation_checklists;
CREATE POLICY "Users can update own checklists" ON preparation_checklists
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own checklists" ON preparation_checklists;
CREATE POLICY "Users can delete own checklists" ON preparation_checklists
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 4. EMERGENCY KIT ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS emergency_kit_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  item_name TEXT NOT NULL,
  quantity TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'missing',
  priority TEXT NOT NULL DEFAULT 'medium',
  per_person BOOLEAN DEFAULT FALSE,
  expiration_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for emergency_kit_items
ALTER TABLE emergency_kit_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own kit items" ON emergency_kit_items;
CREATE POLICY "Users can view own kit items" ON emergency_kit_items
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own kit items" ON emergency_kit_items;
CREATE POLICY "Users can insert own kit items" ON emergency_kit_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own kit items" ON emergency_kit_items;
CREATE POLICY "Users can update own kit items" ON emergency_kit_items
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own kit items" ON emergency_kit_items;
CREATE POLICY "Users can delete own kit items" ON emergency_kit_items
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 5. SOS ALERTS TABLE (Department & Citizen Shared)
-- ============================================
CREATE TABLE IF NOT EXISTS sos_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- Index for location queries
CREATE INDEX IF NOT EXISTS idx_sos_alerts_location ON sos_alerts USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_sos_alerts_status ON sos_alerts(status);
CREATE INDEX IF NOT EXISTS idx_sos_alerts_created_at ON sos_alerts(created_at DESC);

-- RLS Policies for sos_alerts
ALTER TABLE sos_alerts ENABLE ROW LEVEL SECURITY;

-- Anyone can insert SOS alerts (even unauthenticated users)
DROP POLICY IF EXISTS "Anyone can create SOS alerts" ON sos_alerts;
CREATE POLICY "Anyone can create SOS alerts" ON sos_alerts
  FOR INSERT WITH CHECK (true);

-- Users can view their own SOS alerts
DROP POLICY IF EXISTS "Users can view own SOS alerts" ON sos_alerts;
CREATE POLICY "Users can view own SOS alerts" ON sos_alerts
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() IS NULL);

-- Public read for all SOS alerts (so departments can see them)
DROP POLICY IF EXISTS "Public can view all SOS alerts" ON sos_alerts;
CREATE POLICY "Public can view all SOS alerts" ON sos_alerts
  FOR SELECT USING (true);

-- Public can update SOS alerts (for department responses)
DROP POLICY IF EXISTS "Public can update SOS alerts" ON sos_alerts;
CREATE POLICY "Public can update SOS alerts" ON sos_alerts
  FOR UPDATE USING (true);

-- ============================================
-- 6. DISASTERS TABLE (Active Disasters Monitoring)
-- ============================================
CREATE TABLE IF NOT EXISTS disasters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  disaster_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  location GEOGRAPHY(POINT, 4326),
  location_text TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  affected_areas TEXT[] DEFAULT '{}',
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  casualties INTEGER DEFAULT 0,
  evacuees INTEGER DEFAULT 0,
  damage_estimate DECIMAL(15, 2),
  response_level TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Index for location queries
CREATE INDEX IF NOT EXISTS idx_disasters_location ON disasters USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_disasters_status ON disasters(status);
CREATE INDEX IF NOT EXISTS idx_disasters_created_at ON disasters(created_at DESC);

-- RLS Policies for disasters
ALTER TABLE disasters ENABLE ROW LEVEL SECURITY;

-- Public can view all disasters
DROP POLICY IF EXISTS "Public can view disasters" ON disasters;
CREATE POLICY "Public can view disasters" ON disasters
  FOR SELECT USING (true);

-- Public can insert disasters
DROP POLICY IF EXISTS "Public can insert disasters" ON disasters;
CREATE POLICY "Public can insert disasters" ON disasters
  FOR INSERT WITH CHECK (true);

-- Public can update disasters
DROP POLICY IF EXISTS "Public can update disasters" ON disasters;
CREATE POLICY "Public can update disasters" ON disasters
  FOR UPDATE USING (true);

-- ============================================
-- 7. HOSPITALS TABLE (Healthcare Integration)
-- ============================================
CREATE TABLE IF NOT EXISTS hospitals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  emergency_number TEXT,
  location GEOGRAPHY(POINT, 4326),
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  total_beds INTEGER DEFAULT 0,
  available_beds INTEGER DEFAULT 0,
  icu_beds INTEGER DEFAULT 0,
  available_icu_beds INTEGER DEFAULT 0,
  emergency_capacity TEXT DEFAULT 'normal',
  specialties TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'operational',
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for location queries
CREATE INDEX IF NOT EXISTS idx_hospitals_location ON hospitals USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_hospitals_status ON hospitals(status);

-- RLS Policies for hospitals
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;

-- Public can view all hospitals
DROP POLICY IF EXISTS "Public can view hospitals" ON hospitals;
CREATE POLICY "Public can view hospitals" ON hospitals
  FOR SELECT USING (true);

-- Public can insert hospitals
DROP POLICY IF EXISTS "Public can insert hospitals" ON hospitals;
CREATE POLICY "Public can insert hospitals" ON hospitals
  FOR INSERT WITH CHECK (true);

-- Public can update hospitals
DROP POLICY IF EXISTS "Public can update hospitals" ON hospitals;
CREATE POLICY "Public can update hospitals" ON hospitals
  FOR UPDATE USING (true);

-- ============================================
-- 8. EVACUATION CENTERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS evacuation_centers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  barangay TEXT NOT NULL,
  city TEXT NOT NULL,
  location GEOGRAPHY(POINT, 4326),
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  capacity INTEGER DEFAULT 0,
  current_occupancy INTEGER DEFAULT 0,
  contact_number TEXT,
  facilities TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'available',
  disaster_types TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for location queries
CREATE INDEX IF NOT EXISTS idx_evacuation_centers_location ON evacuation_centers USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_evacuation_centers_status ON evacuation_centers(status);

-- RLS Policies for evacuation_centers
ALTER TABLE evacuation_centers ENABLE ROW LEVEL SECURITY;

-- Public can view all evacuation centers
DROP POLICY IF EXISTS "Public can view evacuation centers" ON evacuation_centers;
CREATE POLICY "Public can view evacuation centers" ON evacuation_centers
  FOR SELECT USING (true);

-- Public can insert evacuation centers
DROP POLICY IF EXISTS "Public can insert evacuation centers" ON evacuation_centers;
CREATE POLICY "Public can insert evacuation centers" ON evacuation_centers
  FOR INSERT WITH CHECK (true);

-- Public can update evacuation centers
DROP POLICY IF EXISTS "Public can update evacuation centers" ON evacuation_centers;
CREATE POLICY "Public can update evacuation centers" ON evacuation_centers
  FOR UPDATE USING (true);

-- ============================================
-- 9. USER ACTIVITY LOG
-- ============================================
CREATE TABLE IF NOT EXISTS user_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  activity_type TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for activity queries
CREATE INDEX IF NOT EXISTS idx_activity_user_id ON user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_created_at ON user_activity_log(created_at DESC);

-- RLS Policies for user_activity_log
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;

-- Users can view own activity
DROP POLICY IF EXISTS "Users can view own activity" ON user_activity_log;
CREATE POLICY "Users can view own activity" ON user_activity_log
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert own activity
DROP POLICY IF EXISTS "Users can insert own activity" ON user_activity_log;
CREATE POLICY "Users can insert own activity" ON user_activity_log
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Public can view all activity logs
DROP POLICY IF EXISTS "Public can view activity logs" ON user_activity_log;
CREATE POLICY "Public can view activity logs" ON user_activity_log
  FOR SELECT USING (true);

-- ============================================
-- 10. KV STORE TABLE (Generic Key-Value Storage)
-- ============================================
CREATE TABLE IF NOT EXISTS kv_store (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for kv_store
ALTER TABLE kv_store ENABLE ROW LEVEL SECURITY;

-- Public can read kv_store
DROP POLICY IF EXISTS "Public can read kv_store" ON kv_store;
CREATE POLICY "Public can read kv_store" ON kv_store
  FOR SELECT USING (true);

-- Public can insert to kv_store
DROP POLICY IF EXISTS "Public can insert to kv_store" ON kv_store;
CREATE POLICY "Public can insert to kv_store" ON kv_store
  FOR INSERT WITH CHECK (true);

-- Public can update kv_store
DROP POLICY IF EXISTS "Public can update to kv_store" ON kv_store;
CREATE POLICY "Public can update to kv_store" ON kv_store
  FOR UPDATE USING (true);

-- ============================================
-- 11. ENABLE REALTIME FOR ALL TABLES
-- ============================================

-- Enable realtime for user_profiles
ALTER PUBLICATION supabase_realtime ADD TABLE user_profiles;

-- Enable realtime for emergency_contacts
ALTER PUBLICATION supabase_realtime ADD TABLE emergency_contacts;

-- Enable realtime for preparation_checklists
ALTER PUBLICATION supabase_realtime ADD TABLE preparation_checklists;

-- Enable realtime for emergency_kit_items
ALTER PUBLICATION supabase_realtime ADD TABLE emergency_kit_items;

-- Enable realtime for sos_alerts
ALTER PUBLICATION supabase_realtime ADD TABLE sos_alerts;

-- Enable realtime for disasters
ALTER PUBLICATION supabase_realtime ADD TABLE disasters;

-- Enable realtime for hospitals
ALTER PUBLICATION supabase_realtime ADD TABLE hospitals;

-- Enable realtime for evacuation_centers
ALTER PUBLICATION supabase_realtime ADD TABLE evacuation_centers;

-- Enable realtime for user_activity_log
ALTER PUBLICATION supabase_realtime ADD TABLE user_activity_log;

-- Enable realtime for kv_store
ALTER PUBLICATION supabase_realtime ADD TABLE kv_store;

-- ============================================
-- 12. CREATE UPDATED_AT TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_emergency_contacts_updated_at ON emergency_contacts;
CREATE TRIGGER update_emergency_contacts_updated_at
  BEFORE UPDATE ON emergency_contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_preparation_checklists_updated_at ON preparation_checklists;
CREATE TRIGGER update_preparation_checklists_updated_at
  BEFORE UPDATE ON preparation_checklists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_emergency_kit_items_updated_at ON emergency_kit_items;
CREATE TRIGGER update_emergency_kit_items_updated_at
  BEFORE UPDATE ON emergency_kit_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sos_alerts_updated_at ON sos_alerts;
CREATE TRIGGER update_sos_alerts_updated_at
  BEFORE UPDATE ON sos_alerts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_disasters_updated_at ON disasters;
CREATE TRIGGER update_disasters_updated_at
  BEFORE UPDATE ON disasters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_evacuation_centers_updated_at ON evacuation_centers;
CREATE TRIGGER update_evacuation_centers_updated_at
  BEFORE UPDATE ON evacuation_centers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_kv_store_updated_at ON kv_store;
CREATE TRIGGER update_kv_store_updated_at
  BEFORE UPDATE ON kv_store
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 13. INSERT SAMPLE HOSPITALS DATA
-- ============================================

INSERT INTO hospitals (name, address, city, contact_number, latitude, longitude, total_beds, available_beds, icu_beds, available_icu_beds, specialties)
VALUES
  ('Philippine General Hospital', 'Taft Avenue, Manila', 'Manila', '(02) 8554-8400', 14.5795, 120.9842, 1500, 300, 100, 20, ARRAY['Emergency', 'Surgery', 'Pediatrics', 'Cardiology']),
  ('Makati Medical Center', '2 Amorsolo Street, Makati', 'Makati', '(02) 8888-8999', 14.5547, 121.0244, 600, 120, 50, 10, ARRAY['Emergency', 'Surgery', 'Oncology', 'Cardiology']),
  ('St. Luke''s Medical Center - BGC', '23rd St. cor 7th Ave, BGC, Taguig', 'Taguig', '(02) 8789-7700', 14.5507, 121.0494, 700, 140, 60, 12, ARRAY['Emergency', 'Surgery', 'Neurology', 'Cardiology']),
  ('The Medical City', 'Ortigas Avenue, Pasig', 'Pasig', '(02) 8988-1000', 14.5860, 121.0615, 650, 130, 55, 11, ARRAY['Emergency', 'Surgery', 'Pediatrics', 'Orthopedics']),
  ('Asian Hospital and Medical Center', '2205 Civic Drive, Filinvest City, Muntinlupa', 'Muntinlupa', '(02) 8771-9000', 14.4291, 121.0422, 400, 80, 40, 8, ARRAY['Emergency', 'Surgery', 'Cardiology']),
  ('Veterans Memorial Medical Center', 'North Avenue, Quezon City', 'Quezon City', '(02) 8927-0001', 14.6520, 121.0438, 1000, 200, 80, 16, ARRAY['Emergency', 'Surgery', 'Rehabilitation']),
  ('Lung Center of the Philippines', 'Quezon Avenue, Quezon City', 'Quezon City', '(02) 8924-6101', 14.6388, 121.0375, 300, 60, 30, 6, ARRAY['Pulmonology', 'Surgery', 'Emergency']),
  ('Taguig-Pateros District Hospital', 'Cayetano Blvd, Taguig', 'Taguig', '(02) 8837-7536', 14.5176, 121.0509, 200, 40, 20, 4, ARRAY['Emergency', 'General Medicine'])
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 14. INSERT SAMPLE EVACUATION CENTERS
-- ============================================

INSERT INTO evacuation_centers (name, address, barangay, city, latitude, longitude, capacity, current_occupancy, facilities, disaster_types)
VALUES
  ('Rizal Memorial Sports Complex', 'Pablo Ocampo Sr. Ave, Malate', 'Malate', 'Manila', 14.5764, 120.9936, 5000, 0, ARRAY['Shelter', 'Medical', 'Food', 'Water'], ARRAY['Flood', 'Typhoon', 'Earthquake']),
  ('Marikina Sports Center', 'Sumulong Highway, Marikina', 'Sto. Niño', 'Marikina', 14.6507, 121.1024, 3000, 0, ARRAY['Shelter', 'Medical', 'Food'], ARRAY['Flood', 'Typhoon']),
  ('Quezon City Memorial Circle', 'Elliptical Road, Quezon City', 'Central', 'Quezon City', 14.6536, 121.0500, 10000, 0, ARRAY['Shelter', 'Medical', 'Food', 'Water'], ARRAY['Typhoon', 'Earthquake']),
  ('Pasig Rainforest Park', 'C. Raymundo Ave, Pasig', 'Maybunga', 'Pasig', 14.5672, 121.0961, 2000, 0, ARRAY['Shelter', 'Water'], ARRAY['Flood', 'Typhoon']),
  ('Taguig Integrated School', 'Gen. Santos Ave, Taguig', 'Central Signal Village', 'Taguig', 14.5176, 121.0639, 1500, 0, ARRAY['Shelter', 'Food', 'Water'], ARRAY['Flood', 'Typhoon', 'Earthquake'])
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SETUP COMPLETE!
-- ============================================

-- Verify tables were created
SELECT 'Setup complete! Tables created:' as message;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
