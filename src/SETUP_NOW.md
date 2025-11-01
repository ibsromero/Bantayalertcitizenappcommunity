# 🚨 SETUP REQUIRED - Tables Don't Exist Yet

## The Problem

You're seeing these errors because the database tables haven't been created in Supabase yet:

```
❌ Could not find the table 'public.sos_alerts' in the schema cache
```

This means you need to **run the SQL setup script** to create all the tables.

---

## ⚡ Quick Fix (5 minutes)

### Step 1: Open Supabase Dashboard

1. Go to: https://app.supabase.com
2. Sign in to your account
3. Select your project (the one you're using for BantayAlert)

### Step 2: Open SQL Editor

1. In the left sidebar, click **"SQL Editor"**
2. Click **"New query"** button

### Step 3: Copy and Paste SQL

1. Open this file in your project: `/SUPABASE_REALTIME_SETUP.sql`
2. Press `Ctrl+A` (Windows) or `Cmd+A` (Mac) to select all
3. Press `Ctrl+C` (Windows) or `Cmd+C` (Mac) to copy
4. Go back to Supabase SQL Editor
5. Press `Ctrl+V` (Windows) or `Cmd+V` (Mac) to paste
6. Click the **"RUN"** button (or press `Ctrl+Enter`)

### Step 4: Wait for Success

You should see:
```
✅ Success. No rows returned
```

This means all tables, triggers, and sample data were created!

### Step 5: Enable Realtime

1. In Supabase Dashboard, click **"Database"** in the left sidebar
2. Click **"Replication"**
3. Find these tables and toggle them **ON** (to green):
   - `sos_alerts`
   - `disaster_events`
   - `hospitals`
   - `weather_warnings`
   - `analytics_summary`

### Step 6: Refresh Your App

1. Go back to your BantayAlert app
2. Press `F5` or refresh the page
3. Login to department dashboard again

**The errors should be gone!** ✅

---

## 🔍 Verify Setup

After running the SQL, you can verify tables were created:

1. In Supabase Dashboard, click **"Table Editor"**
2. You should see these tables:
   - ✅ `department_users` (5 rows)
   - ✅ `sos_alerts` (0 rows - empty, ready to use)
   - ✅ `disaster_events` (0 rows)
   - ✅ `hospitals` (8 rows)
   - ✅ `weather_warnings` (0 rows)
   - ✅ `analytics_summary` (1 row)

If you see these tables, **setup is complete!**

---

## 🎯 What Gets Created

When you run the SQL setup, it creates:

### Tables (6 main tables)
- `department_users` - Department authentication
- `sos_alerts` - SOS alerts from citizens
- `disaster_events` - Active disasters
- `hospitals` - Hospital capacity tracking
- `weather_warnings` - Weather alerts from departments
- `analytics_summary` - Dashboard statistics

### Sample Data
- 4 department accounts (LGU, Emergency Responder, Healthcare, NDRRMC)
- 8 NCR hospitals with capacity data
- 1 analytics summary row

### Automation
- Triggers to auto-update analytics
- Triggers to auto-update timestamps
- Functions for calculations
- Row Level Security (RLS) policies

---

## ❓ Troubleshooting

### Issue: "Permission denied for table"
**Solution:** Make sure you're signed in as the project owner in Supabase.

### Issue: "Relation already exists"
**Solution:** Tables already exist! Just enable Realtime (Step 5) and refresh your app.

### Issue: SQL Editor shows error
**Solution:** 
1. Check if you copied the entire SQL file
2. Make sure you're in the correct project
3. Try running the SQL in smaller chunks if needed

### Issue: Still seeing errors after setup
**Solution:**
1. Verify tables exist in Table Editor
2. Verify Realtime is enabled for all 5 tables
3. Clear your browser cache
4. Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

---

## 📞 Test Credentials

After setup is complete, you can login with:

```
Email: manila.lgu@bantayalert.ph
Password: Manila2025!
```

Other test accounts:
- `quezon.lgu@bantayalert.ph` / `Quezon2025!`
- `bfp.ncr@bantayalert.ph` / `FireProtection2025!`
- `pgh.healthcare@bantayalert.ph` / `Healthcare2025!`
- `ndrrmc@bantayalert.ph` / `DisasterMgmt2025!`

All credentials are in `/utils/setupDepartmentPasswords.ts`

---

## ✅ Success Checklist

After running the SQL, check these:

```
□ Supabase SQL ran successfully (saw "Success" message)
□ Tables visible in Table Editor
□ department_users has 5 rows
□ hospitals has 8 rows
□ Realtime enabled for 5 tables (all green toggles)
□ Refreshed the app
□ Login works with test credentials
□ Dashboard loads without errors
□ "Real-Time Database Connected" banner shows
```

If all checked, **you're done!** 🎉

---

## 🚀 What's Next

Once setup is complete:

1. **Test SOS Alert**: Create one from citizen side
2. **Check Department Dashboard**: Should see the alert appear
3. **Test Weather Warning**: Create one from department side
4. **Check Real-Time**: Open dashboard in 2 tabs, changes sync instantly

---

**DON'T SKIP THIS STEP!** The SQL setup is required for everything to work. Without it, the app has no database tables to read from.

Run the SQL now → Enable Realtime → Refresh app → You're done! ✅
