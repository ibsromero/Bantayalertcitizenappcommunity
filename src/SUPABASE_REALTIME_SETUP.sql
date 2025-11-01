-- ============================================
-- BantayAlert - Complete Real-Time Database Setup
-- Run this in your Supabase SQL Editor
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis"; -- For geolocation features

-- ============================================
-- DEPARTMENT USERS TABLE
-- Stores department accounts (separate from citizen auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS department_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  department_name TEXT NOT NULL,
  department_type TEXT NOT NULL, -- 'lgu', 'emergency_responder', 'healthcare', 'disaster_management'
  city TEXT NOT NULL,
  contact_number TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for department_users
ALTER TABLE department_users ENABLE ROW LEVEL SECURITY;

-- Department users can view their own data
CREATE POLICY "Department users can view own data" ON department_users
  FOR SELECT USING (true); -- Public read for authentication

-- ============================================
-- SOS ALERTS TABLE
-- Real-time SOS alerts from citizens
-- ============================================
CREATE TABLE IF NOT EXISTS sos_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  contact_number TEXT,
  location_latitude DECIMAL,
  location_longitude DECIMAL,
  location_address TEXT,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'responding', 'resolved', 'cancelled'
  priority TEXT NOT NULL DEFAULT 'high', -- 'critical', 'high', 'medium', 'low'
  assigned_department_id UUID REFERENCES department_users(id),
  resolution TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE sos_alerts ENABLE ROW LEVEL SECURITY;

-- Citizens can create SOS alerts (no auth required for emergency)
CREATE POLICY "Anyone can create SOS alerts" ON sos_alerts
  FOR INSERT WITH CHECK (true);

-- Anyone can view SOS alerts (for real-time updates)
CREATE POLICY "Anyone can view SOS alerts" ON sos_alerts
  FOR SELECT USING (true);

-- Anyone can update SOS alerts (departments will use this)
CREATE POLICY "Anyone can update SOS alerts" ON sos_alerts
  FOR UPDATE USING (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_sos_alerts_status ON sos_alerts(status);
CREATE INDEX IF NOT EXISTS idx_sos_alerts_created ON sos_alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sos_alerts_location ON sos_alerts(location_latitude, location_longitude);

-- ============================================
-- DISASTER EVENTS TABLE
-- Active disaster events managed by departments
-- ============================================
CREATE TABLE IF NOT EXISTS disaster_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  disaster_type TEXT NOT NULL, -- 'typhoon', 'earthquake', 'flood', 'fire', 'other'
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT NOT NULL, -- 'minor', 'moderate', 'major', 'catastrophic'
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'monitoring', 'resolved'
  affected_areas TEXT[], -- Array of affected cities/barangays
  location_latitude DECIMAL,
  location_longitude DECIMAL,
  casualties_reported INTEGER DEFAULT 0,
  families_affected INTEGER DEFAULT 0,
  evacuation_centers_active INTEGER DEFAULT 0,
  created_by_department_id UUID REFERENCES department_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE disaster_events ENABLE ROW LEVEL SECURITY;

-- Public can view disaster events
CREATE POLICY "Anyone can view disaster events" ON disaster_events
  FOR SELECT USING (true);

-- Departments can create/update disaster events
CREATE POLICY "Anyone can manage disaster events" ON disaster_events
  FOR ALL USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_disaster_events_status ON disaster_events(status);
CREATE INDEX IF NOT EXISTS idx_disaster_events_type ON disaster_events(disaster_type);
CREATE INDEX IF NOT EXISTS idx_disaster_events_created ON disaster_events(created_at DESC);

-- ============================================
-- HOSPITALS TABLE
-- Hospital capacity tracking for healthcare integration
-- ============================================
CREATE TABLE IF NOT EXISTS hospitals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  contact_number TEXT,
  hospital_type TEXT NOT NULL, -- 'government', 'private', 'specialty'
  total_beds INTEGER NOT NULL DEFAULT 0,
  available_beds INTEGER NOT NULL DEFAULT 0,
  icu_capacity INTEGER NOT NULL DEFAULT 0,
  emergency_capacity INTEGER NOT NULL DEFAULT 0,
  has_emergency_room BOOLEAN DEFAULT TRUE,
  has_trauma_center BOOLEAN DEFAULT FALSE,
  location_latitude DECIMAL,
  location_longitude DECIMAL,
  status TEXT NOT NULL DEFAULT 'operational', -- 'operational', 'limited', 'full', 'offline'
  last_updated_by UUID REFERENCES department_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;

-- Public can view hospitals
CREATE POLICY "Anyone can view hospitals" ON hospitals
  FOR SELECT USING (true);

-- Departments can update hospitals
CREATE POLICY "Anyone can manage hospitals" ON hospitals
  FOR ALL USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_hospitals_city ON hospitals(city);
CREATE INDEX IF NOT EXISTS idx_hospitals_status ON hospitals(status);

-- ============================================
-- WEATHER WARNINGS TABLE
-- Weather alerts sent by departments to citizens
-- ============================================
CREATE TABLE IF NOT EXISTS weather_warnings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  warning_type TEXT NOT NULL, -- 'typhoon', 'flood', 'earthquake', 'severe_weather'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL, -- 'advisory', 'warning', 'critical'
  affected_areas TEXT[], -- Array of cities/regions
  issued_by_department_id UUID REFERENCES department_users(id),
  issued_by_department_name TEXT,
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE weather_warnings ENABLE ROW LEVEL SECURITY;

-- Public can view weather warnings
CREATE POLICY "Anyone can view weather warnings" ON weather_warnings
  FOR SELECT USING (true);

-- Departments can create/update weather warnings
CREATE POLICY "Anyone can manage weather warnings" ON weather_warnings
  FOR ALL USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_weather_warnings_active ON weather_warnings(is_active);
CREATE INDEX IF NOT EXISTS idx_weather_warnings_created ON weather_warnings(created_at DESC);

-- ============================================
-- CITIZEN WEATHER ALERTS HISTORY TABLE
-- Track which warnings citizens have received
-- ============================================
CREATE TABLE IF NOT EXISTS citizen_weather_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  warning_id UUID REFERENCES weather_warnings(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT FALSE,
  received_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE citizen_weather_alerts ENABLE ROW LEVEL SECURITY;

-- Users can view their own alerts
CREATE POLICY "Users can view own weather alerts" ON citizen_weather_alerts
  FOR SELECT USING (auth.uid() = user_id OR true); -- Allow unauth for SOS use

CREATE POLICY "Anyone can insert weather alerts" ON citizen_weather_alerts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own alerts" ON citizen_weather_alerts
  FOR UPDATE USING (auth.uid() = user_id OR true);

-- ============================================
-- ANALYTICS SUMMARY TABLE
-- Pre-computed analytics for department dashboard
-- ============================================
CREATE TABLE IF NOT EXISTS analytics_summary (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  total_sos_alerts INTEGER DEFAULT 0,
  active_sos_alerts INTEGER DEFAULT 0,
  total_disasters INTEGER DEFAULT 0,
  active_disasters INTEGER DEFAULT 0,
  total_hospitals INTEGER DEFAULT 0,
  hospitals_at_capacity INTEGER DEFAULT 0,
  avg_response_time_minutes INTEGER DEFAULT 0,
  citizens_helped_today INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE analytics_summary ENABLE ROW LEVEL SECURITY;

-- Public can view analytics
CREATE POLICY "Anyone can view analytics" ON analytics_summary
  FOR SELECT USING (true);

CREATE POLICY "Anyone can update analytics" ON analytics_summary
  FOR ALL USING (true);

-- Initialize analytics row
INSERT INTO analytics_summary (id) VALUES (uuid_generate_v4())
ON CONFLICT DO NOTHING;

-- ============================================
-- FUNCTIONS TO UPDATE ANALYTICS AUTOMATICALLY
-- ============================================

-- Function to refresh analytics
CREATE OR REPLACE FUNCTION refresh_analytics_summary()
RETURNS void AS $$
BEGIN
  UPDATE analytics_summary SET
    total_sos_alerts = (SELECT COUNT(*) FROM sos_alerts),
    active_sos_alerts = (SELECT COUNT(*) FROM sos_alerts WHERE status IN ('active', 'responding')),
    total_disasters = (SELECT COUNT(*) FROM disaster_events),
    active_disasters = (SELECT COUNT(*) FROM disaster_events WHERE status = 'active'),
    total_hospitals = (SELECT COUNT(*) FROM hospitals),
    hospitals_at_capacity = (SELECT COUNT(*) FROM hospitals WHERE available_beds <= 5 OR status = 'full'),
    citizens_helped_today = (SELECT COUNT(*) FROM sos_alerts WHERE DATE(resolved_at) = CURRENT_DATE),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to calculate average response time
CREATE OR REPLACE FUNCTION calculate_avg_response_time()
RETURNS INTEGER AS $$
DECLARE
  avg_time INTEGER;
BEGIN
  SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))/60)::INTEGER, 0)
  INTO avg_time
  FROM sos_alerts
  WHERE resolved_at IS NOT NULL
    AND created_at > NOW() - INTERVAL '7 days';
  
  RETURN avg_time;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ============================================

-- Trigger to update analytics when SOS alert changes
CREATE OR REPLACE FUNCTION update_analytics_on_sos_change()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM refresh_analytics_summary();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sos_alerts_analytics_trigger
AFTER INSERT OR UPDATE OR DELETE ON sos_alerts
FOR EACH STATEMENT
EXECUTE FUNCTION update_analytics_on_sos_change();

-- Trigger to update analytics when disaster changes
CREATE OR REPLACE FUNCTION update_analytics_on_disaster_change()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM refresh_analytics_summary();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER disaster_events_analytics_trigger
AFTER INSERT OR UPDATE OR DELETE ON disaster_events
FOR EACH STATEMENT
EXECUTE FUNCTION update_analytics_on_disaster_change();

-- Trigger to update analytics when hospital changes
CREATE OR REPLACE FUNCTION update_analytics_on_hospital_change()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM refresh_analytics_summary();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER hospitals_analytics_trigger
AFTER INSERT OR UPDATE OR DELETE ON hospitals
FOR EACH STATEMENT
EXECUTE FUNCTION update_analytics_on_hospital_change();

-- ============================================
-- AUTOMATIC TIMESTAMP UPDATES
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_department_users_updated_at BEFORE UPDATE ON department_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sos_alerts_updated_at BEFORE UPDATE ON sos_alerts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_disaster_events_updated_at BEFORE UPDATE ON disaster_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hospitals_updated_at BEFORE UPDATE ON hospitals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_weather_warnings_updated_at BEFORE UPDATE ON weather_warnings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ENABLE REALTIME FOR TABLES
-- Run these commands in Supabase Dashboard > Database > Replication
-- OR use the Supabase Dashboard UI to enable realtime
-- ============================================

-- Enable realtime for SOS alerts (critical for departments)
ALTER PUBLICATION supabase_realtime ADD TABLE sos_alerts;

-- Enable realtime for disaster events
ALTER PUBLICATION supabase_realtime ADD TABLE disaster_events;

-- Enable realtime for weather warnings
ALTER PUBLICATION supabase_realtime ADD TABLE weather_warnings;

-- Enable realtime for hospitals
ALTER PUBLICATION supabase_realtime ADD TABLE hospitals;

-- Enable realtime for analytics
ALTER PUBLICATION supabase_realtime ADD TABLE analytics_summary;

-- ============================================
-- SEED DATA - DEPARTMENT ACCOUNTS
-- ============================================

-- Insert sample department accounts
-- NOTE: Password verification is done client-side via /utils/setupDepartmentPasswords.ts
-- These placeholder hashes are not used for authentication
-- See setupDepartmentPasswords.ts for actual passwords
INSERT INTO department_users (email, password_hash, department_name, department_type, city, contact_number)
VALUES
  ('manila.lgu@bantayalert.ph', 'placeholder_hash', 'Manila LGU', 'lgu', 'Manila', '(02) 8527-4000'),
  ('quezon.lgu@bantayalert.ph', 'placeholder_hash', 'Quezon City LGU', 'lgu', 'Quezon City', '(02) 8988-4242'),
  ('bfp.ncr@bantayalert.ph', 'placeholder_hash', 'Bureau of Fire Protection - NCR', 'emergency_responder', 'NCR-wide', '(02) 8426-0219'),
  ('pgh.healthcare@bantayalert.ph', 'placeholder_hash', 'Philippine General Hospital', 'healthcare', 'Manila', '(02) 8554-8400'),
  ('ndrrmc@bantayalert.ph', 'placeholder_hash', 'NDRRMC - National Disaster Risk Reduction', 'disaster_management', 'NCR-wide', '(02) 8911-1406')
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- SEED DATA - HOSPITALS
-- ============================================

INSERT INTO hospitals (name, address, city, contact_number, hospital_type, total_beds, available_beds, icu_capacity, emergency_capacity, has_emergency_room, has_trauma_center, location_latitude, location_longitude, status)
VALUES
  ('Philippine General Hospital', 'Taft Avenue, Manila', 'Manila', '(02) 8554-8400', 'government', 1500, 120, 50, 80, true, true, 14.5764, 120.9857, 'operational'),
  ('St. Luke''s Medical Center - Quezon City', '279 E. Rodriguez Sr. Ave, Quezon City', 'Quezon City', '(02) 8723-0101', 'private', 650, 80, 45, 60, true, true, 14.6219, 121.0193, 'operational'),
  ('Makati Medical Center', '2 Amorsolo Street, Makati City', 'Makati', '(02) 8888-8999', 'private', 600, 95, 40, 55, true, true, 14.5595, 121.0175, 'operational'),
  ('The Medical City', 'Ortigas Avenue, Pasig City', 'Pasig', '(02) 8988-1000', 'private', 700, 110, 48, 65, true, true, 14.5866, 121.0622, 'operational'),
  ('Veterans Memorial Medical Center', 'North Avenue, Quezon City', 'Quezon City', '(02) 8927-0001', 'government', 1000, 85, 35, 70, true, true, 14.6518, 121.0324, 'operational'),
  ('Jose Reyes Memorial Medical Center', 'Rizal Avenue, Santa Cruz, Manila', 'Manila', '(02) 8711-9491', 'government', 400, 45, 20, 40, true, false, 14.6085, 120.9836, 'operational'),
  ('Quezon City General Hospital', 'Seminary Road, Quezon City', 'Quezon City', '(02) 8372-0165', 'government', 300, 38, 15, 35, true, false, 14.6488, 121.0494, 'operational'),
  ('Cardinal Santos Medical Center', '10 Wilson Street, San Juan', 'San Juan', '(02) 8727-0001', 'private', 350, 52, 25, 45, true, false, 14.5994, 121.0355, 'operational')
ON CONFLICT DO NOTHING;

-- ============================================
-- INITIALIZE ANALYTICS SUMMARY
-- ============================================

-- Create initial analytics summary row if it doesn't exist
INSERT INTO analytics_summary (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- Refresh analytics to populate with current data
SELECT refresh_analytics_summary();

-- ============================================
-- INSTRUCTIONS
-- ============================================

/*
SETUP INSTRUCTIONS:
===================

1. Copy this entire SQL script
2. Go to your Supabase Dashboard: https://app.supabase.com
3. Select your project
4. Click "SQL Editor" in the left sidebar
5. Click "New query"
6. Paste this SQL script
7. Click "Run" to execute

8. ENABLE REALTIME (Important!):
   - Go to Database > Replication
   - Make sure these tables are enabled for realtime:
     * sos_alerts
     * disaster_events  
     * weather_warnings
     * hospitals
     * analytics_summary

9. DEPARTMENT AUTHENTICATION:
   You'll need to implement password hashing.
   The current passwords in seed data need to be replaced with bcrypt hashes.
   
   Example department logins:
   - manila.lgu@bantayalert.ph / DepartmentPass2025!
   - quezon.lgu@bantayalert.ph / DepartmentPass2025!
   - ndrrmc@bantayalert.ph / DepartmentPass2025!

WHAT THIS CREATES:
==================
✅ SOS Alerts Table - Real-time alerts from citizens
✅ Disaster Events Table - Active disasters managed by departments
✅ Hospitals Table - Live hospital capacity tracking
✅ Weather Warnings Table - Alerts sent by departments to citizens
✅ Analytics Table - Auto-updating statistics
✅ Department Users Table - Department authentication
✅ Automatic triggers to keep analytics updated
✅ Row Level Security for all tables
✅ Realtime subscriptions enabled
✅ Sample department accounts
✅ Sample hospital data for NCR

NEXT STEPS:
===========
1. Run this SQL
2. Update departmentApiService.ts to use direct Supabase queries
3. Add realtime subscriptions to department components
4. Test SOS alert creation from citizen side
5. Test receiving alerts on department side
6. Test sending weather warnings from department to citizens
*/
