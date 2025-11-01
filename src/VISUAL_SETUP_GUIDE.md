# 🎨 Visual Setup Guide - Real-Time BantayAlert

## 📸 Step-by-Step Visual Instructions

---

## STEP 1: Open Supabase Dashboard

```
┌────────────────────────────────────────────────┐
│  🌐 Browser: https://app.supabase.com         │
└────────────────────────────────────────────────┘
              │
              ▼
┌────────────────────────────────────────────────┐
│  📋 Sign in to your account                    │
│  ┌──────────────────────────────────────────┐ │
│  │  Email: your@email.com                   │ │
│  │  Password: ••••••••••                    │ │
│  │  [Sign In]                               │ │
│  └──────────────────────────────────────────┘ │
└─────────────────────────────────────��──────────┘
```

---

## STEP 2: Select Your Project

```
┌────────────────────────────────────────────────┐
│  Supabase Dashboard - Projects                 │
├────────────────────────────────────────────────┤
│                                                │
│  ┌──────────────────┐  ┌──────────────────┐  │
│  │  My Project      │  │  Other Project   │  │
│  │  ├─ Active       │  │  ├─ Active       │  │
│  │  └─ [Open]  ◄─── │  │  └─ [Open]       │  │ CLICK YOUR PROJECT
│  └──────────────────┘  └──────────────────┘  │
│                                                │
└────────────────────────────────────────────────┘
```

---

## STEP 3: Open SQL Editor

```
┌────────────────────────────────────────────────┐
│  Supabase Dashboard - Your Project             │
├────────────────────────────────────────────────┤
│  SIDEBAR:                                      │
│  ┌────────────────┐                           │
│  │ 📊 Home        │                           │
│  │ 📋 Table Editor│                           │
│  │ 🔧 SQL Editor  │ ◄────── CLICK HERE        │
│  │ 🔐 Auth        │                           │
│  │ 📦 Storage     │                           │
│  │ 🔴 Realtime    │                           │
│  │ ⚙️  Settings   │                           │
│  └────────────────┘                           │
└────────────────────────────────────────────────┘
```

---

## STEP 4: Create New Query

```
┌────────────────────────────────────────────────┐
│  SQL Editor                                    │
├────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────┐ │
│  │ [+ New query] ◄─── CLICK HERE            │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  Recent queries:                               │
│  - Query 1                                     │
│  - Query 2                                     │
│                                                │
└────────────────────────────────────────────────┘
```

---

## STEP 5: Paste SQL Script

```
┌────────────────────────────────────────────────┐
│  SQL Editor - New Query                        │
├────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────┐ │
│  │ 1  -- BantayAlert Database Setup         │ │
│  │ 2  CREATE EXTENSION IF NOT EXISTS ...    │ │
│  │ 3  CREATE TABLE IF NOT EXISTS ...        │ │ PASTE THE SQL FROM
│  │ 4  ...                                    │ │ SUPABASE_REALTIME_SETUP.sql
│  │ 5  ...                                    │ │ HERE
│  │ ...                                       │ │
│  │ 500+ lines of SQL                         │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  [RUN] ◄─────── THEN CLICK HERE               │
└────────────────────────────────────────────────┘
```

---

## STEP 6: Wait for Success

```
┌────────────────────────────────────────────────┐
│  SQL Editor - Running Query                    │
├────────────────────────────────────────────────┤
│  ⏳ Running query...                           │
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │ Creating tables...                        │ │
│  │ Setting up triggers...                    │ │
│  │ Inserting sample data...                  │ │
│  │ ...                                       │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  ✅ Success! Query completed in 2.3 seconds   │
│                                                │
└────────────────────────────────────────────────┘
```

---

## STEP 7: Verify Tables Created

```
┌────────────────────────────────────────────────┐
│  Table Editor                                  │
├────────────────────────────────────────────────┤
│  TABLES:                                       │
│  ┌────────────────┐                           │
│  │ ✅ department_users (5 rows)               │
│  │ ✅ sos_alerts (0 rows)                     │
│  │ ✅ disaster_events (0 rows)                │
│  │ ✅ hospitals (8 rows)                      │
│  │ ✅ weather_warnings (0 rows)               │
│  │ ✅ analytics_summary (1 row)               │
│  └────────────────┘                           │
│                                                │
│  ◄─── YOU SHOULD SEE ALL THESE TABLES         │
└────────────────────────────────────────────────┘
```

---

## STEP 8: Enable Realtime

```
┌────────────────────────────────────────────────┐
│  Database → Replication                        │
├────────────────────────────────────────────────┤
│  Realtime Tables:                              │
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │ Table             | Realtime  | Actions  │ │
│  │────────────────────────────────────────── │ │
│  │ sos_alerts        | [OFF]⚪   | Enable   │ │ CLICK TO ENABLE
│  │ disaster_events   | [OFF]⚪   | Enable   │ │
│  │ hospitals         | [OFF]⚪   | Enable   │ │
│  │ weather_warnings  | [OFF]⚪   | Enable   │ │
│  │ analytics_summary | [OFF]⚪   | Enable   │ │
│  └──────────────────────────────────────────┘ │
│                                                │
└────────────────────────────────────────────────┘

AFTER ENABLING:

┌────────────────────────────────────────────────┐
│  Database → Replication                        │
├────────────────────────────────────────────────┤
│  Realtime Tables:                              │
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │ Table             | Realtime  | Actions  │ │
│  │────────────────────────────────────────── │ │
│  │ sos_alerts        | [ON]🟢    | Disable  │ │ ✅ ALL GREEN
│  │ disaster_events   | [ON]🟢    | Disable  │ │
│  │ hospitals         | [ON]🟢    | Disable  │ │
│  │ weather_warnings  | [ON]🟢    | Disable  │ │
│  │ analytics_summary | [ON]🟢    | Disable  │ │
│  └──────────────────────────────────────────┘ │
│                                                │
└────────────────────────────────────────────────┘
```

---

## STEP 9: Test Department Login

```
┌────────────────────────────────────────────────┐
│  BantayAlert - Department Login                │
├────────────────────────────────────────────────┤
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │  Email:                                  │ │
│  │  manila.lgu@bantayalert.ph               │ │
│  │                                          │ │
│  │  Password:                               │ │
│  │  Manila2025!                             │ │
│  │                                          │ │
│  │  [Sign In]  ◄───── CLICK HERE            │ │
│  └──────────────────────────────────────────┘ │
│                                                │
└────────────────────────────────────────────────┘

AFTER LOGIN:

┌────────────────────────────────────────────────┐
│  BantayAlert - Department Dashboard            │
├────────────────────────────────────────────────┤
│  Welcome, Manila LGU!                          │
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │  📊 Active SOS Alerts: 0                 │ │
│  │  🌊 Active Disasters: 0                  │ │ ✅ SUCCESS!
│  │  🏥 Hospitals: 8                         │ │
│  │  📈 Response Time: 0 min                 │ │
│  └──────────────────────────────────────────┘ │
│                                                │
└────────────────────────────────────────────────┘
```

---

## VISUAL: Complete System Flow

```
┌───────────────────────────────────────────────────────────────┐
│                    BANTAYALERT SYSTEM                         │
└───────────────────────────────────────────────────────────────┘

CITIZEN SIDE:                    DEPARTMENT SIDE:
┌────────────┐                   ┌────────────┐
│  📱 Phone  │                   │  💻 Laptop │
│            │                   │            │
│ [SOS Button│                   │ Dashboard  │
│  PRESSED]  │                   │  Open      │
└─────┬──────┘                   └──────┬─────┘
      │                                 │
      │ 1. createSOSAlert()             │
      ▼                                 │
┌──────────────────────────────────┐    │
│  realtimeDepartmentService.ts    │    │
│  - Validates data                │    │
│  - Inserts to database           │    │
└──────┬───────────────────────────┘    │
       │                                │
       │ 2. INSERT INTO sos_alerts      │
       ▼                                │
┌──────────────────────────────────┐    │
│     SUPABASE DATABASE            │    │
│                                  │    │
│  sos_alerts table:               │    │
│  [NEW ROW INSERTED] ✅           │    │
│                                  │    │
│  Triggers:                       │    │
│  - Update analytics ✅           │    │
│  - Set timestamps ✅             │    │
└──────┬───────────────────────────┘    │
       │                                │
       │ 3. Realtime broadcast          │
       ▼                                │
┌──────────────────────────────────┐    │
│     REALTIME ENGINE              │    │
│  - Detects change                │    │
│  - Broadcasts to all subscribers │    │
└──────┬───────────────────────────┘    │
       │                                │
       │ 4. WebSocket push              │
       │                                │
       └────────────────────────────────┤
                                        │
                   5. Update received   │
                                        ▼
                              ┌────────────┐
                              │ Dashboard  │
                              │ Updates!   │
                              │            │
                              │ 🔔 New     │
                              │   Alert!   │
                              └────────────┘

TIME ELAPSED: ~100-500 milliseconds ⚡
```

---

## VISUAL: Database Structure

```
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE TABLES                          │
└─────────────────────────────────────────────────────────────┘

AUTHENTICATION:
┌──────────────────┐
│ department_users │ (5 departments pre-loaded)
├──────────────────┤
│ id               │ ← Used for authorization
│ email            │ ← Login credential
│ password_hash    │ ← Secured (TODO: bcrypt)
│ department_name  │ ← Display name
│ department_type  │ ← lgu/emergency/healthcare/disaster
│ city             │ ← NCR city
└──────────────────┘

CORE DATA TABLES:
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   sos_alerts     │     │ disaster_events  │     │    hospitals     │
├──────────────────┤     ├──────────────────┤     ├──────────────────┤
│ id               │     │ id               │     │ id               │
│ user_email       │     │ disaster_type    │     │ name             │
│ location_*       │     │ title            │     │ address          │
│ status    🔴     │     │ severity  🔴     │     │ available_beds🔴 │
│ priority         │     │ affected_areas   │     │ status           │
└──────────────────┘     └──────────────────┘     └──────────────────┘
   REALTIME ✅             REALTIME ✅              REALTIME ✅

COMMUNICATION:                METRICS:
┌──────────────────┐     ┌──────────────────┐
│ weather_warnings │     │ analytics_summary│
├──────────────────┤     ├──────────────────┤
│ id               │     │ total_sos_alerts │
│ warning_type     │     │ active_sos_alerts│
│ title            │     │ total_disasters  │
│ severity  🔴     │     │ hospitals_at_cap │
│ affected_areas   │     │ avg_response_time│
└──────────────────┘     └──────────────────┘
   REALTIME ✅              REALTIME ✅

🔴 = Real-time changes broadcast to all clients
```

---

## VISUAL: File Structure

```
YOUR PROJECT
│
├── 📁 components/
│   ├── SOSButton.tsx ───────────────┐
│   ├── WeatherAlerts.tsx            │ CITIZEN SIDE
│   ├── Dashboard.tsx                │ (receives updates)
│   │                                 │
│   └── 📁 department/                │
│       ├── SOSAlertTracker.tsx ──────┤
│       ├── DisasterMonitoring.tsx   │ DEPARTMENT SIDE
│       ├── HealthcareIntegration.tsx│ (sends & receives)
│       └── DataAnalytics.tsx ────────┘
│
├── 📁 utils/
│   ├── realtimeDepartmentService.ts ◄─── ⭐ USE THIS
│   ├── setupDepartmentPasswords.ts  ◄─── 🔑 CREDENTIALS
│   └── supabaseClient.ts
│
└── 📁 Documentation/ (NEW FILES)
    ├── START_HERE_REALTIME.md ◄────────── ⭐ START HERE
    ├── SUPABASE_REALTIME_SETUP.sql ◄───── ⭐ RUN THIS FIRST
    ├── REAL_TIME_SETUP_GUIDE.md
    ├── IMPLEMENTATION_CHECKLIST.md
    ├── QUICK_REFERENCE.md
    ├── SYSTEM_ARCHITECTURE.md
    ├── SWITCH_TO_REAL_TIME.md
    ├── COMPLETE_SOLUTION_SUMMARY.md
    └── VISUAL_SETUP_GUIDE.md (this file)
```

---

## VISUAL: Before vs After

```
BEFORE (Mock Data):
┌────────────────────────────────────────────┐
│  Component loads                           │
│    ↓                                       │
│  Reads from mockDepartmentData.ts          │
│    ↓                                       │
│  Shows fake data                           │
│    ↓                                       │
│  No real-time updates                      │
│    ↓                                       │
│  Changes don't persist                     │
│    ↓                                       │
│  No communication between users            │
└────────────────────────────────────────────┘

AFTER (Real-Time):
┌────────────────────────────────────────────┐
│  Component loads                           │
│    ↓                                       │
│  Queries Supabase database                 │
│    ↓                                       │
│  Shows REAL data                           │
│    ↓                                       │
│  Subscribes to real-time updates           │
│    ↓                                       │
│  Receives instant notifications            │
│    ↓                                       │
│  Changes persist in database               │
│    ↓                                       │
│  All users see updates instantly           │
└────────────────────────────────────────────┘
```

---

## SUCCESS CHECKLIST

Copy this and check off as you complete:

```
□ Opened Supabase Dashboard
□ Found SQL Editor
□ Created new query
□ Pasted SUPABASE_REALTIME_SETUP.sql
□ Clicked RUN
□ Saw "Success" message
□ Verified tables in Table Editor
□ Opened Database → Replication
□ Enabled realtime for sos_alerts
□ Enabled realtime for disaster_events
□ Enabled realtime for hospitals
□ Enabled realtime for weather_warnings
□ Enabled realtime for analytics_summary
□ Tested department login
□ Login worked!
□ Dashboard loaded!
□ Read documentation
□ Ready to implement!
```

---

## VISUAL: Testing Flow

```
TEST 1: Create SOS Alert
┌──────────┐        ┌──────────┐        ┌──────────┐
│ CITIZEN  │        │ DATABASE │        │  DEPT    │
│   APP    │        │          │        │ DASHBOARD│
└────┬─────┘        └────┬─────┘        └────┬─────┘
     │                   │                   │
     │ 1. Click SOS      │                   │
     ├──────────────────>│                   │
     │                   │                   │
     │                   │ 2. Insert row     │
     │                   ├──────────────────>│
     │                   │                   │
     │                   │ 3. Broadcast      │
     │                   ├──────────────────>│
     │                   │                   │
     │                   │                   │ 4. Show alert!
     │                   │                   ├──────────┐
     │                   │                   │ 🔔 New!  │
     │                   │                   └──────────┘

TEST 2: Update Status
┌──────────┐        ┌──────────┐        ┌──────────┐
│ CITIZEN  │        │ DATABASE │        │  DEPT    │
│   APP    │        │          │        │ DASHBOARD│
└────┬─────┘        └────┬─────┘        └────┬─────┘
     │                   │                   │
     │                   │    5. Update      │
     │                   │<──────────────────┤
     │                   │    status         │
     │                   │                   │
     │ 6. Broadcast      │                   │
     │<──────────────────┤                   │
     │                   │                   │
     │ 7. Show update!   │                   │
     ├──────────┐        │                   │
     │ Status:  │        │                   │
     │Responding│        │                   │
     └──────────┘        │                   │
```

---

## 🎉 YOU'RE READY!

```
┌─────────────────────────────────────────────┐
│                                             │
│         ✅ SETUP COMPLETE!                  │
│                                             │
│  You now have a fully functional            │
│  real-time disaster preparedness system!    │
│                                             │
│  🚨 SOS Alerts working                      │
│  🌦️  Weather Warnings working               │
│  🏥 Hospital Tracking working               │
│  📊 Analytics working                       │
│  🔐 Authentication working                  │
│                                             │
│  Ready to save lives! 🇵🇭                   │
│                                             │
└─────────────────────────────────────────────┘
```

---

**Next:** Follow `/IMPLEMENTATION_CHECKLIST.md` to update your code! 🚀
