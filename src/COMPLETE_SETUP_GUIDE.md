# BantayAlert - Complete Setup Guide

## Overview
This guide will help you set up BantayAlert with full Supabase integration, real-time updates, and Android deployment.

---

## Part 1: Supabase Database Setup

### Step 1: Access Supabase SQL Editor
1. Go to https://app.supabase.com
2. Sign in and select your project: `gzefyknnjlsjmcgndbfn`
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Run the Complete Setup Script
1. Open the file `/COMPLETE_SUPABASE_SETUP.sql`
2. Copy the ENTIRE contents
3. Paste into the Supabase SQL Editor
4. Click **Run** (or press Ctrl/Cmd + Enter)
5. Wait for completion (should take 10-30 seconds)

### Step 3: Verify Setup
Run this query to verify all tables were created:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

You should see these tables:
- `disasters`
- `emergency_contacts`
- `emergency_kit_items`
- `evacuation_centers`
- `hospitals`
- `kv_store`
- `preparation_checklists`
- `sos_alerts`
- `user_activity_log`
- `user_profiles`

---

## Part 2: Disable Email Confirmation

### Step 1: Navigate to Auth Settings
1. In Supabase Dashboard, go to **Authentication** → **Settings**
2. Scroll to **Email Auth Settings** section

### Step 2: Disable Email Confirmation
1. Find **"Confirm email"** toggle
2. **Turn it OFF** (disable it)
3. Click **Save**

**What this does:**
- Users can login immediately after signup
- No email verification needed
- Accounts are auto-confirmed

---

## Part 3: Enable Realtime (IMPORTANT!)

### Step 1: Enable Realtime for Database
1. Go to **Database** → **Replication** in Supabase Dashboard
2. You should see all tables listed
3. Make sure these tables have **realtime enabled**:
   - `sos_alerts` ✅
   - `disasters` ✅
   - `hospitals` ✅
   - `user_profiles` ✅
   - `emergency_contacts` ✅
   - `kv_store` ✅

### Step 2: Verify Realtime is Working
Run this query to check realtime publication:
```sql
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';
```

---

## Part 4: Test the Application

### Test Citizen Features:
1. **Sign Up**
   - Open the app
   - Click "Sign In" 
   - Go to "Sign Up" tab
   - Create account with:
     - Name: Test User
     - Email: test@example.com
     - Password: test123
   - Should login immediately (no email confirmation needed)

2. **Test SOS Alert**
   - Click the red SOS button
   - Fill in emergency details
   - Click "Send SOS Alert"
   - Alert should save to Supabase `sos_alerts` table

3. **Test Emergency Kit**
   - Go to Emergency Kit tab
   - Add a new item
   - Change family size
   - Delete an item
   - Everything should sync to Supabase

### Test Department Features:
1. **Login as Department**
   - Click "Sign In"
   - Select "Department" tab
   - Use one of these accounts:
     - **LGU**: lgu@bantayalert.ph / LGU@NCR2024
     - **Emergency Responder**: responder@bantayalert.ph / RESPONDER@NCR2024
     - **Healthcare**: healthcare@bantayalert.ph / HEALTHCARE@NCR2024
     - **NDRRMC**: ndrrmc@bantayalert.ph / NDRRMC@NCR2024

2. **Test Department Dashboard**
   - Should see real SOS alerts from database
   - Should see hospital data
   - Should see disaster monitoring
   - Should see data analytics

3. **Test Real-time Updates**
   - Keep department dashboard open
   - In another tab/window, create a citizen SOS alert
   - Department dashboard should automatically update (may take 1-5 seconds)

---

## Part 5: Verify Data in Supabase

### Check SOS Alerts:
```sql
SELECT * FROM sos_alerts ORDER BY created_at DESC LIMIT 10;
```

### Check User Profiles:
```sql
SELECT * FROM user_profiles ORDER BY created_at DESC;
```

### Check Hospitals:
```sql
SELECT name, city, available_beds, status FROM hospitals;
```

### Check All Tables Row Counts:
```sql
SELECT 
  'sos_alerts' as table_name, COUNT(*) as rows FROM sos_alerts
UNION ALL
SELECT 'user_profiles', COUNT(*) FROM user_profiles
UNION ALL
SELECT 'disasters', COUNT(*) FROM disasters
UNION ALL
SELECT 'hospitals', COUNT(*) FROM hospitals
UNION ALL
SELECT 'evacuation_centers', COUNT(*) FROM evacuation_centers;
```

---

## Part 6: Android Deployment (Capacitor)

### Prerequisites:
- Android Studio installed
- Java JDK 11 or higher
- Node.js and npm installed

### Step 1: Install Capacitor
```bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android
```

### Step 2: Initialize Capacitor
```bash
npx cap init
```
When prompted:
- App name: BantayAlert
- App package ID: com.bantayalert.app

### Step 3: Build the Web App
```bash
npm run build
```

### Step 4: Add Android Platform
```bash
npx cap add android
```

### Step 5: Sync with Capacitor
```bash
npx cap sync android
```

### Step 6: Open in Android Studio
```bash
npx cap open android
```

### Step 7: Configure Android Permissions
Edit `android/app/src/main/AndroidManifest.xml` and add:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.CALL_PHONE" />
```

### Step 8: Build APK in Android Studio
1. In Android Studio, go to **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
2. Wait for build to complete
3. APK will be at: `android/app/build/outputs/apk/debug/app-debug.apk`

### Step 9: Install on Phone
1. Connect phone via USB
2. Enable Developer Options on phone
3. Enable USB Debugging
4. In Android Studio, click **Run** (green play button)
5. Select your device
6. App will install and launch

---

## Part 7: Troubleshooting

### SOS Alerts not showing on Department side:
1. Check if `sos_alerts` table has data:
   ```sql
   SELECT * FROM sos_alerts;
   ```
2. Verify RLS policies allow public read:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'sos_alerts';
   ```
3. Check realtime is enabled for `sos_alerts` table

### Users not saving to Supabase:
1. Check if email confirmation is disabled (Part 2)
2. Verify `user_profiles` table exists
3. Check browser console for errors

### Realtime not working:
1. Verify realtime is enabled in Supabase Dashboard
2. Check all tables are in `supabase_realtime` publication:
   ```sql
   SELECT tablename FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
   ```
3. Make sure RLS policies allow public SELECT

### Android build errors:
1. Make sure Android Studio is up to date
2. Verify Java JDK is version 11+
3. Clean and rebuild:
   - In Android Studio: **Build** → **Clean Project**
   - Then: **Build** → **Rebuild Project**

---

## Part 8: Testing Checklist

### Citizen Side:
- [ ] Sign up new account
- [ ] Login with account
- [ ] Create emergency contact
- [ ] Edit emergency contact
- [ ] Delete emergency contact
- [ ] Add item to emergency kit
- [ ] Delete item from emergency kit
- [ ] Change family size (kit quantities update)
- [ ] Send SOS alert
- [ ] View weather alerts
- [ ] View evacuation routes
- [ ] Update profile

### Department Side:
- [ ] Login with department credentials
- [ ] View SOS alerts dashboard
- [ ] Filter SOS alerts by status
- [ ] Update SOS alert status
- [ ] View disaster monitoring
- [ ] View hospital capacity
- [ ] Call hospital from list
- [ ] View data analytics
- [ ] View emergency map
- [ ] Real-time SOS alert appears automatically

### Real-time Features:
- [ ] Citizen sends SOS → Appears on department dashboard (within 5 seconds)
- [ ] Hospital capacity updated → Shows on department side immediately
- [ ] New disaster created → Shows on monitoring page immediately

---

## Part 9: GitHub & Web Deployment

### Step 1: Push to GitHub
```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: BantayAlert app"

# Add remote (replace with your GitHub repo URL)
git remote add origin https://github.com/ibsromero/Bantayalertdepartment

# Push to GitHub
git push -u origin main
```

### Step 2: Enable GitHub Pages
1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under **Source**, select:
   - Branch: `gh-pages`
   - Folder: `/ (root)`
4. Click **Save**

### Step 3: GitHub Actions Automatic Deployment
- Already configured in `.github/workflows/deploy.yml`
- Automatically builds and deploys on every push to `main`
- Access your app at: `https://YOUR_USERNAME.github.io/REPO_NAME`

### Step 4: Custom Domain (Optional)
1. Add `CNAME` file with your domain
2. Configure DNS: Add CNAME record pointing to `YOUR_USERNAME.github.io`
3. Update `.github/workflows/deploy.yml` with your custom domain

### Alternative Hosting Options:

**Vercel:**
```bash
npm install -g vercel
vercel
```

**Netlify:**
```bash
npm install -g netlify-cli
netlify deploy --prod
```

---

## Part 10: Important URLs

- **Supabase Dashboard**: https://app.supabase.com/project/gzefyknnjlsjmcgndbfn
- **Supabase API URL**: https://gzefyknnjlsjmcgndbfn.supabase.co
- **SQL Editor**: https://app.supabase.com/project/gzefyknnjlsjmcgndbfn/editor
- **Realtime Settings**: https://app.supabase.com/project/gzefyknnjlsjmcgndbfn/database/replication

---

## Part 11: Credentials Reference

### Department Accounts:
- **LGU**: lgu@bantayalert.ph / LGU@NCR2024
- **Emergency Responder**: responder@bantayalert.ph / RESPONDER@NCR2024
- **Healthcare Provider**: healthcare@bantayalert.ph / HEALTHCARE@NCR2024
- **NDRRMC**: ndrrmc@bantayalert.ph / NDRRMC@NCR2024

### Supabase Project:
- **Project ID**: gzefyknnjlsjmcgndbfn
- **Project URL**: https://gzefyknnjlsjmcgndbfn.supabase.co
- **Anon Key**: Check `/utils/supabase/info.tsx`

---

## Summary

You've now:
✅ Set up complete database with all tables
✅ Enabled real-time updates
✅ Disabled email confirmation for instant login
✅ Configured RLS policies for security
✅ Added sample hospital and evacuation center data
✅ Prepared for Android deployment

**Everything should now be fully functional with Supabase integration!**
