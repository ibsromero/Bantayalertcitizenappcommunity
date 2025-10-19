# BantayAlert - Supabase Integration Complete

## Overview

BantayAlert now has **complete Supabase integration** for all user data. Every piece of user data is stored in Supabase and is visible and manageable through your Supabase dashboard.

## What's Integrated

### ✅ All User Data is in Supabase

1. **Emergency Contacts** - All personal emergency contacts with phone numbers
2. **Preparation Checklists** - Earthquake, flood, and typhoon preparedness checklists with completion tracking
3. **Emergency Kit Items** - Complete inventory with quantities, status, and priorities
4. **Kit Expirations** - Track expiration dates for food, medicine, and supplies
5. **Equipment Tests** - Testing schedule and status for emergency equipment
6. **User Settings** - Location, family size, alert preferences
7. **Communication Plans** - Family meeting points and out-of-town contacts
8. **Evacuation Favorites** - Saved evacuation centers
9. **Activity Logs** - Complete history of every user action
10. **Weather Alerts History** - All received weather alerts

### ✅ Real-time Data Sync

- **On Login**: All data is automatically loaded from Supabase
- **On Action**: Changes are immediately saved to Supabase
- **Auto Migration**: Existing localStorage data is automatically migrated on first login
- **Offline Support**: Data is cached locally for offline access

### ✅ Row Level Security (RLS)

- Users can only see and modify their own data
- Complete data isolation between users
- Admins can view all data through Supabase dashboard

## Quick Start

### 1. Set Up Your Database

Run the SQL script to create all tables:

```bash
# Open /utils/supabaseSetup.ts
# Copy the DATABASE_SETUP_SQL constant
# Paste it into Supabase SQL Editor
# Click "Run"
```

Detailed instructions: See `SUPABASE_SETUP_GUIDE.md`

### 2. That's It!

The app will automatically:
- Detect when users log in
- Migrate any existing localStorage data to Supabase
- Sync all future changes to Supabase
- Load data from Supabase on every session

## Managing Data in Supabase

### View All User Data

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click **"Table Editor"**
3. Browse through all 13 tables

### Monitor User Activity

```sql
-- View recent user activities
SELECT 
  up.email,
  al.activity_type,
  al.activity_description,
  al.activity_timestamp
FROM activity_logs al
JOIN user_profiles up ON al.user_id = up.id
ORDER BY al.activity_timestamp DESC
LIMIT 100;
```

### Check Emergency Preparedness Status

```sql
-- See which users are most prepared
SELECT 
  up.email,
  AVG(pc.progress) as avg_preparedness
FROM user_profiles up
LEFT JOIN preparation_checklists pc ON up.id = pc.user_id
GROUP BY up.email
ORDER BY avg_preparedness DESC;
```

### View Emergency Contacts

```sql
-- See all emergency contacts
SELECT 
  up.email,
  ec.name,
  ec.phone_number,
  ec.contact_type,
  ec.is_primary
FROM emergency_contacts ec
JOIN user_profiles up ON ec.user_id = up.id
ORDER BY up.email, ec.is_primary DESC;
```

### Track Kit Inventory

```sql
-- See what items users have ready
SELECT 
  up.email,
  eki.name as item_name,
  eki.quantity,
  eki.status,
  eki.priority
FROM emergency_kit_items eki
JOIN user_profiles up ON eki.user_id = up.id
WHERE eki.status = 'ready'
ORDER BY up.email, eki.priority;
```

## Data Flow

### When User Signs Up
1. User account created in Supabase Auth
2. User profile created in `user_profiles` table
3. Default checklists and kit items initialized
4. Activity logged

### When User Adds Emergency Contact
1. Contact saved to `emergency_contacts` table
2. Activity logged to `activity_logs` table
3. Data synced to localStorage for offline access
4. Toast notification shown to user

### When User Completes Checklist Item
1. Item updated in `checklist_items` table
2. Progress recalculated in `preparation_checklists` table
3. Activity logged
4. Dashboard updated in real-time

### When User Logs In
1. Supabase session established
2. Check if migration needed (first time login)
3. If migration needed:
   - Read all localStorage data
   - Save to Supabase tables
   - Mark migration complete
4. If already migrated:
   - Load all data from Supabase
   - Cache in localStorage
5. Start monitoring for data changes

## Architecture

### Database Layer (`/utils/supabaseDataService.ts`)
- All CRUD operations for every table
- Type-safe interfaces
- Error handling
- Migration utilities

### Sync Layer (`/utils/dataSyncUtils.ts`)
- Auto-migration logic
- Data synchronization
- Default data initialization
- Offline support

### Component Layer
- Components use data service functions
- Real-time updates
- Optimistic UI updates
- Error handling with toast notifications

## File Structure

```
/utils/
  ├── supabaseSetup.ts           # SQL schema and setup instructions
  ├── supabaseDataService.ts      # All CRUD operations
  ├── dataSyncUtils.ts            # Migration and sync logic
  ├── supabaseClient.ts           # Supabase client config
  └── storageUtils.ts             # localStorage utilities (fallback)

/components/
  ├── EmergencyContacts.tsx       # Uses Supabase for contacts
  ├── PreparationChecklist.tsx    # Uses Supabase for checklists
  ├── EmergencyKit.tsx            # Uses Supabase for kit items
  └── Dashboard.tsx               # Uses Supabase for activities

/
  ├── SUPABASE_SETUP_GUIDE.md     # Detailed setup instructions
  └── SUPABASE_INTEGRATION.md     # This file
```

## Database Schema

### Core Tables

1. **user_profiles** - Basic user info
   - id (UUID, FK to auth.users)
   - email
   - name
   - timestamps

2. **emergency_contacts** - User's emergency contacts
   - id (UUID)
   - user_id (FK)
   - name, phone_number, contact_type
   - is_primary
   - timestamps

3. **preparation_checklists** - Disaster checklists
   - id (UUID)
   - user_id (FK)
   - checklist_type (earthquake/flood/typhoon)
   - progress
   - timestamps

4. **checklist_items** - Individual checklist tasks
   - id (UUID)
   - checklist_id (FK)
   - user_id (FK)
   - item_text, completed, item_order
   - timestamps

5. **emergency_kit_categories** - Kit categories
   - id (UUID)
   - user_id (FK)
   - category_type (food/tools/safety)
   - name
   - timestamps

6. **emergency_kit_items** - Items in emergency kit
   - id (UUID)
   - category_id (FK)
   - user_id (FK)
   - name, quantity, status, priority
   - per_person (boolean)
   - timestamps

7. **kit_item_expirations** - Expiration tracking
   - id (UUID)
   - kit_item_id (FK)
   - user_id (FK)
   - expiration_date, last_checked
   - timestamps

8. **equipment_tests** - Equipment test tracking
   - id (UUID)
   - kit_item_id (FK)
   - user_id (FK)
   - last_tested, test_status, next_test_date
   - timestamps

9. **user_settings** - User preferences
   - id (UUID)
   - user_id (FK)
   - location_city, coordinates, family_members
   - alert preferences
   - timestamps

10. **communication_plans** - Family communication
    - id (UUID)
    - user_id (FK)
    - meeting points, out-of-town contact
    - notes
    - timestamps

11. **evacuation_favorites** - Saved evacuation routes
    - id (UUID)
    - user_id (FK)
    - center details
    - timestamps

12. **activity_logs** - Complete activity history
    - id (UUID)
    - user_id (FK)
    - activity_type, description
    - timestamp
    - metadata (JSON)

13. **weather_alerts_history** - Alert history
    - id (UUID)
    - user_id (FK)
    - alert details, severity
    - is_read
    - timestamp
    - metadata (JSON)

## Benefits of Supabase Integration

### For Users
✅ Data accessible from any device
✅ Automatic backup and sync
✅ No data loss on device change
✅ Works offline with local cache
✅ Real-time updates

### For You (Admin)
✅ Complete visibility into all user data
✅ Easy to export data (CSV, JSON)
✅ Run analytics queries
✅ Monitor user engagement
✅ Identify issues quickly
✅ Provide better support

### For Development
✅ Type-safe data operations
✅ Automatic timestamps
✅ Built-in RLS security
✅ Easy to extend with new features
✅ No backend code needed
✅ PostgreSQL power with simple API

## Monitoring & Analytics

### Track User Engagement

```sql
-- Active users in last 7 days
SELECT COUNT(DISTINCT user_id) 
FROM activity_logs 
WHERE activity_timestamp > NOW() - INTERVAL '7 days';

-- Most common activities
SELECT 
  activity_type,
  COUNT(*) as count
FROM activity_logs
GROUP BY activity_type
ORDER BY count DESC;
```

### Check Preparedness Metrics

```sql
-- Average preparedness by disaster type
SELECT 
  checklist_type,
  AVG(progress) as avg_progress,
  COUNT(*) as user_count
FROM preparation_checklists
GROUP BY checklist_type;

-- Users with complete kits
SELECT 
  up.email,
  COUNT(*) FILTER (WHERE eki.status = 'ready') as ready_items,
  COUNT(*) as total_items
FROM user_profiles up
LEFT JOIN emergency_kit_categories ekc ON up.id = ekc.user_id
LEFT JOIN emergency_kit_items eki ON ekc.id = eki.category_id
GROUP BY up.email;
```

## Troubleshooting

### Data Not Syncing?
1. Check browser console for errors
2. Verify user is logged in: `supabase.auth.getUser()`
3. Check Supabase logs for API errors
4. Verify RLS policies are active

### Migration Issues?
1. Check `activity_logs` for migration attempts
2. Verify localStorage has data: Dev Tools → Application → Local Storage
3. Try force sync from browser console: `forceSync()`

### Performance Issues?
1. Check query performance in Supabase
2. Verify indexes are created
3. Review RLS policy efficiency

## Future Enhancements

Potential additions:
- Real-time collaboration (share plans with family)
- Push notifications via Supabase Edge Functions
- Data visualization dashboard
- Export emergency plans as PDF
- SMS alerts integration
- Geofencing for location-based alerts

## Support

For questions or issues:
1. Check `activity_logs` table for user actions
2. Review Supabase logs for errors
3. Check browser console for client-side errors
4. Review this documentation

## Summary

✅ **Complete Integration**: All data in Supabase
✅ **Visible**: View everything in dashboard
✅ **Manageable**: Export, query, analyze
✅ **Secure**: RLS ensures data isolation
✅ **Automatic**: Migration and sync handled automatically
✅ **Production Ready**: Error handling, offline support, real-time updates

Your BantayAlert app now has enterprise-grade data management with full visibility and control! 🎉
