# 🔧 Fix Database Errors - Step by Step

## What's Wrong?

You're seeing this error:
```
❌ Could not find the table 'public.sos_alerts' in the schema cache
```

**This means:** The database tables don't exist yet in Supabase.

**The fix:** Run the SQL setup script (takes 5 minutes).

---

## 🎯 Visual Step-by-Step Fix

### Step 1: Open Your Project Files

Find this file in your project:
```
📁 Your Project
└── SUPABASE_REALTIME_SETUP.sql  ← Open this file
```

### Step 2: Select All and Copy

1. Click inside the file
2. Press `Ctrl+A` (Windows) or `Cmd+A` (Mac) - selects all
3. Press `Ctrl+C` (Windows) or `Cmd+C` (Mac) - copies

You should now have ~500 lines of SQL code copied!

### Step 3: Open Supabase Dashboard

```
🌐 Browser
│
├─→ Go to: https://app.supabase.com
├─→ Sign in
└─→ Click your project
```

### Step 4: Find SQL Editor

```
📊 Supabase Dashboard
│
├─→ Left Sidebar
├─→ Click "SQL Editor" 
└─→ Click "New query" button
```

### Step 5: Paste and Run

```
📝 SQL Editor
│
├─→ Click in the text area
├─→ Press Ctrl+V (or Cmd+V) - paste
├─→ Click "RUN" button (or press Ctrl+Enter)
└─→ Wait for "Success" message ✅
```

### Step 6: Enable Realtime

```
📊 Supabase Dashboard
│
├─→ Left Sidebar
├─→ Click "Database"
├─→ Click "Replication"
└─→ Toggle ON these tables:
    ├─→ sos_alerts [OFF]⚪ → [ON]🟢
    ├─→ disaster_events [OFF]⚪ → [ON]🟢
    ├─→ hospitals [OFF]⚪ → [ON]🟢
    ├─→ weather_warnings [OFF]⚪ → [ON]🟢
    └─→ analytics_summary [OFF]⚪ → [ON]🟢
```

### Step 7: Verify Tables Created

```
📊 Supabase Dashboard
│
├─→ Left Sidebar
├─→ Click "Table Editor"
└─→ You should see:
    ├─→ ✅ department_users (5 rows)
    ├─→ ✅ sos_alerts (0 rows)
    ├─→ ✅ disaster_events (0 rows)
    ├─→ ✅ hospitals (8 rows)
    ├─→ ✅ weather_warnings (0 rows)
    └─→ ✅ analytics_summary (1 row)
```

### Step 8: Refresh Your App

```
💻 Your App
│
├─→ Press F5 (or Ctrl+R)
├─→ Login again to department dashboard
└─→ Errors should be GONE! ✅
```

---

## ✅ Success Indicators

You'll know it worked when you see:

1. ✅ SQL ran without errors in Supabase
2. ✅ Tables visible in Table Editor
3. ✅ No more "table not found" errors
4. ✅ Dashboard loads without errors
5. ✅ Green "Database Setup Complete" banner shows

---

## 🎥 Visual Checklist

Copy this and check off as you go:

```
Setup Checklist:
□ Opened SUPABASE_REALTIME_SETUP.sql file
□ Selected all (Ctrl+A) and copied (Ctrl+C)
□ Opened Supabase Dashboard (https://app.supabase.com)
□ Selected my project
□ Clicked "SQL Editor" in sidebar
□ Clicked "New query"
□ Pasted SQL (Ctrl+V)
□ Clicked "RUN"
□ Saw "Success" message
□ Clicked "Database" → "Replication"
□ Enabled realtime for sos_alerts
□ Enabled realtime for disaster_events
□ Enabled realtime for hospitals
□ Enabled realtime for weather_warnings
□ Enabled realtime for analytics_summary
□ Checked "Table Editor" - saw 6 tables
□ Refreshed my app
□ Errors are GONE! 🎉
```

---

## 🆘 Still Having Issues?

### Issue: Can't find SUPABASE_REALTIME_SETUP.sql
**Location:** It's in the root of your project folder.
**Solution:** Search for "SUPABASE_REALTIME_SETUP" in your file explorer.

### Issue: SQL shows errors when running
**Check:** 
- Are you in the right project?
- Are you signed in as project owner?
- Did you copy the ENTIRE file?

**Solution:** Try copying and pasting in smaller sections if needed.

### Issue: Tables exist but errors persist
**Solution:**
1. Make sure Realtime is enabled (Step 6)
2. Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
3. Clear browser cache
4. Try logging out and back in

### Issue: Still can't fix it
**Check these files for more help:**
- `/SETUP_NOW.md` - Detailed instructions
- `/REAL_TIME_SETUP_GUIDE.md` - Comprehensive guide
- `/QUICK_REFERENCE.md` - Quick commands

---

## 🔑 After Setup - Test Login

Once tables are created, test with:

```
Email: manila.lgu@bantayalert.ph
Password: Manila2025!
```

This should work and you'll see the department dashboard without errors!

---

## 📊 What the SQL Creates

When you run the setup, you get:

**Tables:** 6 main tables with proper relationships
**Sample Data:** 5 departments + 8 hospitals
**Automation:** Auto-updating analytics and timestamps
**Security:** Row Level Security enabled
**Realtime:** Ready for instant updates

---

## ⏱️ Time Required

- Step 1-5: 3 minutes (run SQL)
- Step 6: 1 minute (enable realtime)
- Step 7-8: 1 minute (verify and refresh)

**Total: ~5 minutes** ⚡

---

## 🎉 Done!

Once you see "Database Setup Complete" in your dashboard:

✅ All tables exist
✅ Sample data loaded
✅ Realtime enabled
✅ Ready to use!

**Now you can:**
- Create SOS alerts
- Send weather warnings
- Track hospital capacity
- Monitor disasters
- View real-time analytics

**Everything works with REAL data, not mock data!** 🚀

---

**Need help?** Open `/SETUP_NOW.md` for more details.

**Ready?** Let's go! Open that SQL file and paste it into Supabase! 💪
