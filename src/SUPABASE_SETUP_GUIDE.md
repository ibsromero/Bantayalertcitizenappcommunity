# BantayAlert Supabase Setup Guide

## Overview
This guide will help you set up the Supabase database for BantayAlert. All user data will be stored in Supabase, making it visible and manageable through the Supabase dashboard.

## Step 1: Access Your Supabase Dashboard

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Sign in to your account
3. Select your BantayAlert project

## Step 2: Run the Database Setup Script

### Method 1: Using the SQL Editor (Recommended)

1. In your Supabase dashboard, click on **"SQL Editor"** in the left sidebar
2. Click **"New query"** button
3. Copy the entire SQL script from `/utils/supabaseSetup.ts` (the `DATABASE_SETUP_SQL` constant)
4. Paste it into the SQL editor
5. Click **"Run"** to execute the script

### Method 2: Manual Table Creation

If you prefer to see what's being created, here's a summary of the tables:

## Database Schema

### Tables Created

1. **user_profiles** - Stores user profile information
   - Linked to Supabase Auth users
   
2. **emergency_contacts** - Stores personal emergency contacts
   - Supports CRUD operations
   - Tracks primary contacts
   
3. **preparation_checklists** - Stores disaster preparation checklists
   - Three types: earthquake, flood, typhoon
   - Tracks completion progress
   
4. **checklist_items** - Individual items within checklists
   - Tracks completion status
   - Maintains item order
   
5. **emergency_kit_categories** - Categories for emergency kit items
   - Three types: food, tools, safety
   
6. **emergency_kit_items** - Individual items in emergency kit
   - Tracks status, priority, quantity
   - Supports per-person quantities
   
7. **kit_item_expirations** - Tracks expiration dates for kit items
   - Monitors food/medicine expiration
   
8. **equipment_tests** - Tracks equipment testing schedules
   - Monitors flashlights, radios, etc.
   
9. **user_settings** - User preferences and settings
   - Location, family size, alert preferences
   
10. **communication_plans** - Family communication plans
    - Meeting points, out-of-town contacts
    
11. **evacuation_favorites** - Saved evacuation routes
    
12. **activity_logs** - Complete activity history
    - Every user action is logged
    
13. **weather_alerts_history** - Weather alert history
    - Tracks all received alerts

## Step 3: Verify the Setup

After running the script, verify the tables were created:

1. Click on **"Table Editor"** in the left sidebar
2. You should see all 13 tables listed
3. Click on any table to view its structure and data (will be empty initially)

## Step 4: Understanding Row Level Security (RLS)

All tables have Row Level Security enabled, which means:
- Users can only see and modify their own data
- Data is completely isolated between users
- You (as admin) can see all data in the dashboard

## Managing Data in Supabase Dashboard

### View User Data

1. Go to **"Table Editor"**
2. Select any table (e.g., `emergency_contacts`)
3. You'll see all data from all users
4. Use filters to view specific user's data

### View Activity Logs

1. Go to **"Table Editor"** → **"activity_logs"**
2. You can see every action users take in the app
3. Use the timestamp to track when actions occurred

### Export Data

1. Select any table
2. Click the **"..."** menu
3. Select **"Download as CSV"**

### View Statistics

1. Go to **"SQL Editor"**
2. Run queries like:

```sql
-- Count total users
SELECT COUNT(*) FROM user_profiles;

-- Count emergency contacts per user
SELECT user_id, COUNT(*) as contact_count 
FROM emergency_contacts 
GROUP BY user_id;

-- View recent activities
SELECT * FROM activity_logs 
ORDER BY activity_timestamp DESC 
LIMIT 50;

-- Check checklist completion
SELECT 
  up.email,
  pc.name,
  pc.progress
FROM preparation_checklists pc
JOIN user_profiles up ON pc.user_id = up.id
ORDER BY pc.progress DESC;
```

## Data Migration

The app automatically handles data migration:
- On first login, existing localStorage data is migrated to Supabase
- Migration happens only once per user
- Users will see a success message when migration completes

## Real-time Data Sync

The app syncs data:
- **On login** - All data is loaded from Supabase
- **On action** - Changes are immediately saved to Supabase
- **On app load** - Latest data is pulled if user is logged in

## Monitoring and Maintenance

### View Database Usage

1. Go to **"Settings"** → **"Usage"**
2. Monitor database size and API requests

### View Logs

1. Go to **"Logs"** in the sidebar
2. View real-time database logs
3. Debug any errors

### Backup Data

Supabase automatically backs up your data, but you can also:
1. Export tables as CSV regularly
2. Set up automated backups through Supabase settings

## Troubleshooting

### Tables not created?
- Check for SQL errors in the SQL Editor
- Ensure you have sufficient permissions
- Try running the script in smaller sections

### Users can't see their data?
- Verify RLS policies are enabled
- Check that user is properly authenticated
- Review activity_logs for error messages

### Data not syncing?
- Check browser console for errors
- Verify Supabase API keys in `/utils/supabase/info.tsx`
- Ensure user is logged in

## Privacy and Security

- All data is encrypted at rest by Supabase
- Row Level Security ensures data isolation
- Only authenticated users can access their own data
- You (as admin) have full visibility for support purposes

## Support

For issues:
1. Check browser console for errors
2. View Supabase logs
3. Check the `activity_logs` table for user actions
4. Review RLS policies if users report access issues

## Next Steps

After setup is complete:
1. Test the app by creating an account
2. Add some emergency contacts
3. Check the Supabase dashboard to see the data
4. Review the `activity_logs` table to see tracked actions

Your BantayAlert data is now fully integrated with Supabase and you can manage everything from your dashboard!
