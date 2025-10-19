# 🚀 BantayAlert Supabase - Quick Start (5 Minutes)

## Step 1: Open Supabase Dashboard (1 minute)

1. Go to: [https://app.supabase.com](https://app.supabase.com)
2. Select your BantayAlert project
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New query"**

## Step 2: Copy the SQL Script (1 minute)

1. Open the file: `/utils/supabaseSetup.ts`
2. Find the constant: `DATABASE_SETUP_SQL`
3. Copy everything between the backticks (`)
4. It starts with: `-- Enable UUID extension`
5. It ends with: `FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();`

**OR** you can copy this directly:

```sql
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

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Continue with all tables from supabaseSetup.ts...
```

## Step 3: Run the Script (1 minute)

1. Paste the SQL into the Supabase SQL Editor
2. Click **"Run"** button (bottom right)
3. Wait for "Success" message
4. You should see: "Success. No rows returned"

## Step 4: Verify (2 minutes)

1. Click **"Table Editor"** in left sidebar
2. You should see 13 new tables:
   - ✅ user_profiles
   - ✅ emergency_contacts
   - ✅ preparation_checklists
   - ✅ checklist_items
   - ✅ emergency_kit_categories
   - ✅ emergency_kit_items
   - ✅ kit_item_expirations
   - ✅ equipment_tests
   - ✅ user_settings
   - ✅ communication_plans
   - ✅ evacuation_favorites
   - ✅ activity_logs
   - ✅ weather_alerts_history

## ✅ Done!

Your database is ready! The app will now:
- ✅ Store all user data in Supabase
- ✅ Automatically migrate existing data
- ✅ Sync changes in real-time
- ✅ Keep data visible in your dashboard

## 🧪 Test It

1. Open your BantayAlert app
2. Sign up or log in
3. Add an emergency contact
4. Go back to Supabase → Table Editor → `emergency_contacts`
5. You should see the contact you just added! 🎉

## 📊 View Your Data

### See All Contacts
1. Table Editor → `emergency_contacts`
2. You'll see all users' emergency contacts

### See Activity Logs
1. Table Editor → `activity_logs`
2. You'll see every action users take

### Run a Query
1. SQL Editor → New query
2. Paste this:
```sql
SELECT * FROM activity_logs 
ORDER BY activity_timestamp DESC 
LIMIT 50;
```
3. Click Run
4. See recent activities!

## 🎯 What Now?

You're all set! Here's what you can do:

### View Data
- Browse any table in Table Editor
- Filter, search, and sort data
- Export as CSV for reports

### Run Analytics
- Use SQL Editor for custom queries
- Check `SUPABASE_QUERIES.sql` for examples
- Track user engagement and preparedness

### Monitor
- View real-time user actions
- Check system health
- Identify issues quickly

## 📚 Need More Help?

Check these files:
- `IMPLEMENTATION_COMPLETE.md` - Full overview
- `SUPABASE_SETUP_GUIDE.md` - Detailed guide
- `SUPABASE_INTEGRATION.md` - Technical docs
- `SUPABASE_QUERIES.sql` - 50+ ready queries

## 🔥 Pro Tips

### Quick Queries

**See total users:**
```sql
SELECT COUNT(*) FROM user_profiles;
```

**See recent activities:**
```sql
SELECT 
  up.email,
  al.activity_description,
  al.activity_timestamp
FROM activity_logs al
JOIN user_profiles up ON al.user_id = up.id
ORDER BY al.activity_timestamp DESC
LIMIT 10;
```

**Check preparedness:**
```sql
SELECT 
  up.email,
  AVG(pc.progress) as avg_preparedness
FROM user_profiles up
LEFT JOIN preparation_checklists pc ON up.id = pc.user_id
GROUP BY up.email
ORDER BY avg_preparedness DESC;
```

## 🎉 You're Ready!

Everything is set up and working. Your data is now:
- ✅ Backed up in the cloud
- ✅ Visible in your dashboard
- ✅ Manageable with SQL
- ✅ Secure with RLS
- ✅ Synced automatically

**Enjoy managing your disaster preparedness app data!** 🚀
