-- ============================================
-- PHASE 2: DATABASE TABLES SETUP
-- BantayAlert Emergency Preparedness App
-- ============================================
-- Run this SQL in your Supabase SQL Editor
-- This creates all tables needed for proper functionality
-- ============================================

-- ============================================
-- 1. CITIZEN TABLES
-- ============================================

-- Emergency Contacts
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  relationship TEXT,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_emergency_contacts_user_id ON emergency_contacts(user_id);

-- Preparation Checklists
CREATE TABLE IF NOT EXISTS preparation_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  checklist_type TEXT NOT NULL,
  progress INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_prep_checklists_user_id ON preparation_checklists(user_id);

-- Checklist Items
CREATE TABLE IF NOT EXISTS checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_id UUID REFERENCES preparation_checklists(id) ON DELETE CASCADE,
  item_text TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  item_order INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_checklist_items_checklist_id ON checklist_items(checklist_id);

-- Emergency Kit Categories
CREATE TABLE IF NOT EXISTS emergency_kit_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_kit_categories_user_id ON emergency_kit_categories(user_id);

-- Emergency Kit Items
CREATE TABLE IF NOT EXISTS emergency_kit_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES emergency_kit_categories(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity INTEGER,
  expiry_date DATE,
  notes TEXT,
  checked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_kit_items_category_id ON emergency_kit_items(category_id);
CREATE INDEX IF NOT EXISTS idx_kit_items_user_id ON emergency_kit_items(user_id);

-- User Settings
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  alert_notifications BOOLEAN DEFAULT true,
  emergency_notifications BOOLEAN DEFAULT true,
  location_city TEXT DEFAULT 'Manila',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- Communication Plans
CREATE TABLE IF NOT EXISTS communication_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  meeting_point TEXT,
  out_of_area_contact TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_communication_plans_user_id ON communication_plans(user_id);

-- User Profiles (extended user information)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  phone_number TEXT,
  address TEXT,
  city TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- ============================================
-- 2. DEPARTMENT TABLES
-- ============================================

-- SOS Alerts
CREATE TABLE IF NOT EXISTS sos_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT,
  user_name TEXT,
  contact_number TEXT,
  location_latitude DOUBLE PRECISION,
  location_longitude DOUBLE PRECISION,
  location_address TEXT,
  details TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'responding', 'resolved', 'cancelled')),
  priority TEXT DEFAULT 'high' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  assigned_department_id UUID,
  resolution TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_sos_alerts_status ON sos_alerts(status);
CREATE INDEX IF NOT EXISTS idx_sos_alerts_priority ON sos_alerts(priority);
CREATE INDEX IF NOT EXISTS idx_sos_alerts_created_at ON sos_alerts(created_at DESC);

-- Disaster Events
CREATE TABLE IF NOT EXISTS disaster_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  disaster_type TEXT NOT NULL CHECK (disaster_type IN ('typhoon', 'earthquake', 'flood', 'fire', 'other')),
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT DEFAULT 'moderate' CHECK (severity IN ('minor', 'moderate', 'major', 'catastrophic')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'monitoring', 'resolved')),
  affected_areas TEXT[],
  location_latitude DOUBLE PRECISION,
  location_longitude DOUBLE PRECISION,
  casualties_reported INTEGER DEFAULT 0,
  families_affected INTEGER DEFAULT 0,
  evacuation_centers_active INTEGER DEFAULT 0,
  created_by_department_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_disaster_events_status ON disaster_events(status);
CREATE INDEX IF NOT EXISTS idx_disaster_events_severity ON disaster_events(severity);
CREATE INDEX IF NOT EXISTS idx_disaster_events_created_at ON disaster_events(created_at DESC);

-- Hospitals
CREATE TABLE IF NOT EXISTS hospitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  contact_number TEXT,
  hospital_type TEXT DEFAULT 'government' CHECK (hospital_type IN ('government', 'private', 'specialty')),
  total_beds INTEGER NOT NULL,
  available_beds INTEGER NOT NULL,
  icu_capacity INTEGER DEFAULT 0,
  emergency_capacity INTEGER DEFAULT 0,
  has_emergency_room BOOLEAN DEFAULT true,
  has_trauma_center BOOLEAN DEFAULT false,
  location_latitude DOUBLE PRECISION,
  location_longitude DOUBLE PRECISION,
  status TEXT DEFAULT 'operational' CHECK (status IN ('operational', 'limited', 'full', 'offline')),
  last_updated_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_hospitals_city ON hospitals(city);
CREATE INDEX IF NOT EXISTS idx_hospitals_status ON hospitals(status);

-- Weather Warnings
CREATE TABLE IF NOT EXISTS weather_warnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warning_type TEXT NOT NULL CHECK (warning_type IN ('typhoon', 'flood', 'earthquake', 'severe_weather')),
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT DEFAULT 'warning' CHECK (severity IN ('advisory', 'warning', 'critical')),
  affected_areas TEXT[],
  issued_by_department_id UUID,
  issued_by_department_name TEXT,
  valid_from TIMESTAMPTZ DEFAULT now(),
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_weather_warnings_active ON weather_warnings(is_active);
CREATE INDEX IF NOT EXISTS idx_weather_warnings_valid_from ON weather_warnings(valid_from DESC);

-- Department Users
CREATE TABLE IF NOT EXISTS department_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  department_name TEXT NOT NULL,
  department_type TEXT NOT NULL CHECK (department_type IN ('lgu', 'emergency_responder', 'healthcare', 'disaster_management')),
  city TEXT,
  contact_number TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_department_users_email ON department_users(email);

-- ============================================
-- 3. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE preparation_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_kit_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_kit_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sos_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE disaster_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_warnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE department_users ENABLE ROW LEVEL SECURITY;

-- Citizen Tables Policies (Users can only access their own data)
CREATE POLICY "Users can view own emergency contacts" ON emergency_contacts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own emergency contacts" ON emergency_contacts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own emergency contacts" ON emergency_contacts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own emergency contacts" ON emergency_contacts
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own checklists" ON preparation_checklists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own checklists" ON preparation_checklists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own checklists" ON preparation_checklists
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own checklists" ON preparation_checklists
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own checklist items" ON checklist_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM preparation_checklists 
      WHERE preparation_checklists.id = checklist_items.checklist_id 
      AND preparation_checklists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own checklist items" ON checklist_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM preparation_checklists 
      WHERE preparation_checklists.id = checklist_items.checklist_id 
      AND preparation_checklists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own checklist items" ON checklist_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM preparation_checklists 
      WHERE preparation_checklists.id = checklist_items.checklist_id 
      AND preparation_checklists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own checklist items" ON checklist_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM preparation_checklists 
      WHERE preparation_checklists.id = checklist_items.checklist_id 
      AND preparation_checklists.user_id = auth.uid()
    )
  );

-- Similar policies for emergency kit
CREATE POLICY "Users can view own kit categories" ON emergency_kit_categories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own kit categories" ON emergency_kit_categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own kit categories" ON emergency_kit_categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own kit categories" ON emergency_kit_categories
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own kit items" ON emergency_kit_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own kit items" ON emergency_kit_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own kit items" ON emergency_kit_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own kit items" ON emergency_kit_items
  FOR DELETE USING (auth.uid() = user_id);

-- User settings and profiles
CREATE POLICY "Users can view own settings" ON user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON user_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own communication plan" ON communication_plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own communication plan" ON communication_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own communication plan" ON communication_plans
  FOR UPDATE USING (auth.uid() = user_id);

-- Department Tables Policies (Public read, authenticated write)
CREATE POLICY "Anyone can view SOS alerts" ON sos_alerts
  FOR SELECT USING (true);

CREATE POLICY "Anyone can create SOS alerts" ON sos_alerts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can update SOS alerts" ON sos_alerts
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Anyone can view disasters" ON disaster_events
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create disasters" ON disaster_events
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update disasters" ON disaster_events
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Anyone can view hospitals" ON hospitals
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can update hospitals" ON hospitals
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Anyone can view weather warnings" ON weather_warnings
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create weather warnings" ON weather_warnings
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update weather warnings" ON weather_warnings
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Anyone can view department users" ON department_users
  FOR SELECT USING (true);

-- ============================================
-- 4. ENABLE REALTIME REPLICATION
-- ============================================

-- Enable realtime for department tables (high priority)
ALTER PUBLICATION supabase_realtime ADD TABLE sos_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE disaster_events;
ALTER PUBLICATION supabase_realtime ADD TABLE hospitals;
ALTER PUBLICATION supabase_realtime ADD TABLE weather_warnings;

-- ============================================
-- 5. INSERT SAMPLE DATA
-- ============================================

-- Sample Hospitals (for testing)
INSERT INTO hospitals (id, name, address, city, contact_number, hospital_type, total_beds, available_beds, icu_capacity, emergency_capacity, status)
VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Philippine General Hospital', 'Taft Avenue', 'Manila', '+63 2 8554 8400', 'government', 1500, 320, 45, 85, 'operational'),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Makati Medical Center', 'Makati Avenue', 'Makati City', '+63 2 8888 8999', 'private', 600, 142, 28, 95, 'operational'),
  ('c3d4e5f6-a7b8-9012-cdef-123456789012', 'Veterans Memorial Medical Center', 'North Avenue', 'Quezon City', '+63 2 8927 0001', 'government', 1000, 218, 32, 75, 'operational'),
  ('d4e5f6a7-b8c9-0123-def1-234567890123', 'Pasig City General Hospital', 'Caruncho Avenue', 'Pasig City', '+63 2 8643 1411', 'government', 300, 87, 15, 60, 'operational'),
  ('e5f6a7b8-c9d0-1234-ef12-345678901234', 'Manila Doctors Hospital', 'United Nations Avenue', 'Manila', '+63 2 8558 0888', 'private', 400, 93, 20, 70, 'operational'),
  ('f6a7b8c9-d0e1-2345-f123-456789012345', 'St. Luke''s Medical Center - BGC', '28th Street', 'Taguig City', '+63 2 7789 7700', 'private', 650, 175, 35, 80, 'operational'),
  ('a7b8c9d0-e1f2-3456-1234-567890123456', 'Taguig-Pateros District Hospital', 'Gen. Santos Avenue', 'Taguig City', '+63 2 8789 2345', 'government', 200, 58, 12, 40, 'operational'),
  ('b8c9d0e1-f2a3-4567-2345-678901234567', 'Las Piñas General Hospital', 'Alabang-Zapote Road', 'Las Piñas City', '+63 2 8874 0101', 'government', 350, 82, 18, 55, 'operational')
ON CONFLICT (id) DO NOTHING;

-- Sample Department Users
INSERT INTO department_users (email, department_name, department_type, city, is_active)
VALUES
  ('lgu@bantayalert.ph', 'Local Government Unit - Manila', 'lgu', 'Manila', true),
  ('responder@bantayalert.ph', 'Emergency Response Team', 'emergency_responder', 'Metro Manila', true),
  ('healthcare@bantayalert.ph', 'Healthcare Services', 'healthcare', 'Metro Manila', true),
  ('ndrrmc@bantayalert.ph', 'National Disaster Risk Reduction and Management Council', 'disaster_management', 'Quezon City', true)
ON CONFLICT (email) DO NOTHING;

-- Sample Active Disasters
INSERT INTO disaster_events (id, disaster_type, title, description, severity, status, affected_areas, families_affected, evacuation_centers_active)
VALUES
  ('11111111-2222-3333-4444-555555555555', 'flood', 'Marikina River Flooding', 'Heavy rainfall causing river overflow. Water level at critical stage.', 'major', 'active', ARRAY['Brgy. Tumana', 'Brgy. Santo Niño', 'Brgy. San Roque'], 1250, 1),
  ('22222222-3333-4444-5555-666666666666', 'typhoon', 'Typhoon Signal #2 - NCR', 'Tropical depression affecting NCR with strong winds and heavy rain.', 'moderate', 'active', ARRAY['Quezon City', 'Manila', 'Pasay'], 2500, 2)
ON CONFLICT (id) DO NOTHING;

-- Sample SOS Alerts
INSERT INTO sos_alerts (id, user_email, user_name, contact_number, location_address, details, status, priority)
VALUES
  ('aaaa1111-bbbb-2222-cccc-333333333333', 'maria.santos@email.com', 'Maria Santos', '+63 917 123 4567', 'Brgy. Tumana, Marikina City - Near Marikina River', 'House is flooding rapidly, water level rising. Need immediate evacuation assistance.', 'active', 'critical'),
  ('bbbb2222-cccc-3333-dddd-444444444444', 'juan.cruz@email.com', 'Juan Cruz', '+63 918 234 5678', '123 Commonwealth Ave, Quezon City', 'Elderly person trapped on second floor due to flooding. Medical assistance needed.', 'responding', 'high'),
  ('cccc3333-dddd-4444-eeee-555555555555', 'ana.reyes@email.com', 'Ana Reyes', '+63 919 345 6789', 'Barangay Pio del Pilar, Makati City', 'Power outage and strong winds. Tree fell near house, blocking exit.', 'active', 'medium')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SETUP COMPLETE
-- ============================================

-- Verify tables were created
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
  AND table_name IN (
    'emergency_contacts',
    'preparation_checklists',
    'checklist_items',
    'emergency_kit_categories',
    'emergency_kit_items',
    'user_settings',
    'communication_plans',
    'user_profiles',
    'sos_alerts',
    'disaster_events',
    'hospitals',
    'weather_warnings',
    'department_users'
  )
ORDER BY table_name;

-- Show realtime enabled tables
SELECT tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;
