/**
 * Supabase Database Setup and Migration
 * This file contains SQL scripts to set up all tables and RLS policies
 * Run these in your Supabase SQL Editor
 */

export const DATABASE_SETUP_SQL = `
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USER PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- EMERGENCY CONTACTS TABLE
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

CREATE POLICY "Users can view own contacts" ON emergency_contacts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own contacts" ON emergency_contacts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own contacts" ON emergency_contacts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own contacts" ON emergency_contacts
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- PREPARATION CHECKLISTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS preparation_checklists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  checklist_type TEXT NOT NULL, -- 'earthquake', 'flood', 'typhoon'
  name TEXT NOT NULL,
  progress INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, checklist_type)
);

-- RLS Policies for preparation_checklists
ALTER TABLE preparation_checklists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own checklists" ON preparation_checklists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own checklists" ON preparation_checklists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own checklists" ON preparation_checklists
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own checklists" ON preparation_checklists
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- CHECKLIST ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS checklist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  checklist_id UUID NOT NULL REFERENCES preparation_checklists(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_text TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  item_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for checklist_items
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own checklist items" ON checklist_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own checklist items" ON checklist_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own checklist items" ON checklist_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own checklist items" ON checklist_items
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- EMERGENCY KIT CATEGORIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS emergency_kit_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_type TEXT NOT NULL, -- 'food', 'tools', 'safety'
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category_type)
);

-- RLS Policies for emergency_kit_categories
ALTER TABLE emergency_kit_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own kit categories" ON emergency_kit_categories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own kit categories" ON emergency_kit_categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own kit categories" ON emergency_kit_categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own kit categories" ON emergency_kit_categories
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- EMERGENCY KIT ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS emergency_kit_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES emergency_kit_categories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity TEXT NOT NULL,
  status TEXT NOT NULL, -- 'ready', 'partial', 'missing', 'na'
  priority TEXT NOT NULL, -- 'high', 'medium', 'low'
  per_person BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for emergency_kit_items
ALTER TABLE emergency_kit_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own kit items" ON emergency_kit_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own kit items" ON emergency_kit_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own kit items" ON emergency_kit_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own kit items" ON emergency_kit_items
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- KIT ITEM EXPIRATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS kit_item_expirations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kit_item_id UUID NOT NULL REFERENCES emergency_kit_items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  expiration_date DATE NOT NULL,
  last_checked TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for kit_item_expirations
ALTER TABLE kit_item_expirations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own expirations" ON kit_item_expirations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expirations" ON kit_item_expirations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expirations" ON kit_item_expirations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own expirations" ON kit_item_expirations
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- EQUIPMENT TESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS equipment_tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kit_item_id UUID NOT NULL REFERENCES emergency_kit_items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  equipment_name TEXT NOT NULL,
  last_tested TIMESTAMPTZ,
  test_status TEXT, -- 'working', 'needs_replacement', 'not_tested'
  next_test_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for equipment_tests
ALTER TABLE equipment_tests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own equipment tests" ON equipment_tests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own equipment tests" ON equipment_tests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own equipment tests" ON equipment_tests
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own equipment tests" ON equipment_tests
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- USER SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  location_city TEXT,
  location_latitude DECIMAL,
  location_longitude DECIMAL,
  family_members INTEGER DEFAULT 4,
  alert_severe_weather BOOLEAN DEFAULT TRUE,
  alert_earthquakes BOOLEAN DEFAULT TRUE,
  alert_floods BOOLEAN DEFAULT TRUE,
  alert_typhoons BOOLEAN DEFAULT TRUE,
  notification_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- RLS Policies for user_settings
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own settings" ON user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON user_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- COMMUNICATION PLANS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS communication_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  meeting_point_primary TEXT,
  meeting_point_secondary TEXT,
  out_of_town_contact_name TEXT,
  out_of_town_contact_phone TEXT,
  additional_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- RLS Policies for communication_plans
ALTER TABLE communication_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own communication plan" ON communication_plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own communication plan" ON communication_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own communication plan" ON communication_plans
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- EVACUATION ROUTE FAVORITES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS evacuation_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  center_name TEXT NOT NULL,
  center_address TEXT NOT NULL,
  center_city TEXT NOT NULL,
  is_favorite BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for evacuation_favorites
ALTER TABLE evacuation_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own evacuation favorites" ON evacuation_favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own evacuation favorites" ON evacuation_favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own evacuation favorites" ON evacuation_favorites
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own evacuation favorites" ON evacuation_favorites
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- ACTIVITY LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- 'contact_added', 'checklist_completed', 'item_updated', etc.
  activity_description TEXT NOT NULL,
  activity_timestamp TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB
);

-- RLS Policies for activity_logs
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activity logs" ON activity_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity logs" ON activity_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- WEATHER ALERTS HISTORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS weather_alerts_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL,
  alert_title TEXT NOT NULL,
  alert_description TEXT,
  alert_severity TEXT, -- 'low', 'medium', 'high', 'severe'
  location TEXT,
  alert_timestamp TIMESTAMPTZ DEFAULT NOW(),
  is_read BOOLEAN DEFAULT FALSE,
  metadata JSONB
);

-- RLS Policies for weather_alerts_history
ALTER TABLE weather_alerts_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own weather alerts" ON weather_alerts_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weather alerts" ON weather_alerts_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weather alerts" ON weather_alerts_history
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own weather alerts" ON weather_alerts_history
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_user_id ON emergency_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_checklist_items_checklist_id ON checklist_items(checklist_id);
CREATE INDEX IF NOT EXISTS idx_emergency_kit_items_category_id ON emergency_kit_items(category_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_timestamp ON activity_logs(activity_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_weather_alerts_user_id ON weather_alerts_history(user_id);
CREATE INDEX IF NOT EXISTS idx_weather_alerts_timestamp ON weather_alerts_history(alert_timestamp DESC);

-- ============================================
-- FUNCTIONS FOR AUTOMATIC TIMESTAMPS
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_emergency_contacts_updated_at BEFORE UPDATE ON emergency_contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_preparation_checklists_updated_at BEFORE UPDATE ON preparation_checklists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_checklist_items_updated_at BEFORE UPDATE ON checklist_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_emergency_kit_items_updated_at BEFORE UPDATE ON emergency_kit_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`;

/**
 * Instructions for setting up Supabase
 */
export const SETUP_INSTRUCTIONS = `
SUPABASE DATABASE SETUP INSTRUCTIONS
====================================

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Click on "SQL Editor" in the left sidebar
4. Create a "New query"
5. Copy and paste the SQL from DATABASE_SETUP_SQL
6. Click "Run" to execute the SQL

This will create:
- 13 tables with proper relationships
- Row Level Security (RLS) policies for data isolation
- Indexes for optimal performance
- Automatic timestamp updates

All data will be:
- Isolated per user (users can only see their own data)
- Automatically synced across devices
- Visible in your Supabase dashboard
- Backed up by Supabase

You can view and manage all data in the "Table Editor" section of your Supabase dashboard.
`;
