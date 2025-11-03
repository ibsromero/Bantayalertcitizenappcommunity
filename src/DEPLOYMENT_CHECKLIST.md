# BantayAlert - Deployment Checklist

## Pre-Deployment Checklist

### 1. Supabase Setup ✅
- [ ] Run `COMPLETE_SUPABASE_SETUP.sql` in Supabase SQL Editor
- [ ] Verify all 10 tables created:
  ```sql
  SELECT table_name FROM information_schema.tables 
  WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
  ORDER BY table_name;
  ```
- [ ] Disable email confirmation: Authentication → Settings → Toggle OFF "Confirm email"
- [ ] Enable real-time: Database → Replication → Verify all tables enabled
- [ ] Test database connection:
  ```sql
  SELECT NOW();
  SELECT COUNT(*) FROM hospitals;
  SELECT COUNT(*) FROM evacuation_centers;
  ```

### 2. Environment Variables ✅
- [ ] Verify `/utils/supabase/info.tsx` has correct:
  - `projectId`: gzefyknnjlsjmcgndbfn
  - `publicAnonKey`: (valid key starting with eyJ)
- [ ] Ensure no sensitive data in code (all hardcoded passwords are by design)

### 3. Code Quality ✅
- [ ] No console errors in browser
- [ ] No TypeScript errors: `npm run type-check` (if script exists)
- [ ] All imports resolved
- [ ] No broken links or 404s

### 4. Testing ✅
- [ ] Citizen signup works
- [ ] Citizen login works
- [ ] Department login works (all 4 roles)
- [ ] SOS alerts save to Supabase
- [ ] Emergency contacts save to Supabase
- [ ] Emergency kit items save to Supabase
- [ ] Real-time updates work (test with 2 browser windows)

---

## Web Deployment (GitHub Pages)

### Step 1: Prepare Repository
```bash
# Initialize git (if not done)
git init

# Add all files
git add .

# Commit
git commit -m "Deploy: BantayAlert v1.0"

# Create remote repository on GitHub
# Then add remote (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/bantayalert.git

# Push
git push -u origin main
```

### Step 2: Enable GitHub Actions
- [ ] Verify `.github/workflows/deploy.yml` exists
- [ ] Push code to GitHub
- [ ] Go to repository → **Actions** tab
- [ ] Verify workflow runs successfully (green checkmark)

### Step 3: Enable GitHub Pages
- [ ] Go to repository → **Settings** → **Pages**
- [ ] Source: Select `gh-pages` branch
- [ ] Folder: Select `/ (root)`
- [ ] Click **Save**
- [ ] Wait 2-5 minutes for deployment
- [ ] Access at: `https://YOUR_USERNAME.github.io/bantayalert`

### Step 4: Test Deployed App
- [ ] Open deployed URL
- [ ] Test signup/login
- [ ] Test SOS alert (should save to Supabase)
- [ ] Test emergency contacts
- [ ] Test department login
- [ ] Verify Supabase connection works from deployed app

### Optional: Custom Domain
- [ ] Purchase domain
- [ ] Add CNAME file with domain name
- [ ] Configure DNS: Add CNAME record → `YOUR_USERNAME.github.io`
- [ ] Update `.github/workflows/deploy.yml` with domain
- [ ] Wait for DNS propagation (up to 24 hours)

---

## Alternative: Vercel Deployment

### Quick Deploy
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Follow prompts:
# - Link to existing project or create new
# - Confirm settings
# - Deploy

# Production deployment
vercel --prod
```

### Configuration
- [ ] Environment variables (if any): Dashboard → Settings → Environment Variables
- [ ] Custom domain: Dashboard → Domains → Add
- [ ] Test deployed app

---

## Alternative: Netlify Deployment

### Quick Deploy
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build
npm run build

# Deploy
netlify deploy --prod

# Follow prompts and select 'dist' folder
```

### Configuration
- [ ] Add `netlify.toml` (optional):
  ```toml
  [build]
    publish = "dist"
    command = "npm run build"
  
  [[redirects]]
    from = "/*"
    to = "/index.html"
    status = 200
  ```

---

## Android Deployment

### Step 1: Install Prerequisites
- [ ] Android Studio installed
- [ ] Java JDK 11+ installed
- [ ] Node.js 16+ installed

### Step 2: Install Capacitor
```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
```

### Step 3: Initialize Capacitor
```bash
npx cap init
```
When prompted:
- App name: **BantayAlert**
- Package ID: **com.bantayalert.app**

### Step 4: Build Web App
```bash
npm run build
```

### Step 5: Add Android Platform
```bash
npx cap add android
```

### Step 6: Sync Files
```bash
npx cap sync android
```

### Step 7: Configure Permissions
Edit `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.CALL_PHONE" />
```

### Step 8: Open in Android Studio
```bash
npx cap open android
```

### Step 9: Build APK
- [ ] File → **Invalidate Caches / Restart** (if issues)
- [ ] Build → **Clean Project**
- [ ] Build → **Rebuild Project**
- [ ] Build → **Build Bundle(s) / APK(s)** → **Build APK(s)**
- [ ] Wait for build to complete
- [ ] APK location: `android/app/build/outputs/apk/debug/app-debug.apk`

### Step 10: Test on Device
- [ ] Connect Android device via USB
- [ ] Enable Developer Options on device
- [ ] Enable USB Debugging
- [ ] In Android Studio, click **Run** (green play button)
- [ ] Select your device
- [ ] App installs and launches
- [ ] Test all features

### Step 11: Prepare for Release (Optional)
- [ ] Generate signing key
- [ ] Build → **Generate Signed Bundle / APK**
- [ ] Create release APK
- [ ] Test release build
- [ ] Prepare for Google Play Store submission

---

## Post-Deployment Verification

### Web App
- [ ] App loads without errors
- [ ] All pages accessible
- [ ] Supabase connection working
- [ ] Sign up creates user in database
- [ ] SOS alerts save to database
- [ ] Real-time updates working
- [ ] All API endpoints responding
- [ ] No console errors
- [ ] No broken images/assets
- [ ] Mobile responsive
- [ ] Works on major browsers (Chrome, Firefox, Safari, Edge)

### Android App
- [ ] App installs successfully
- [ ] App opens without crashing
- [ ] All features working
- [ ] Location permission requested
- [ ] Phone permission requested
- [ ] Supabase connection working
- [ ] SOS alerts send successfully
- [ ] Call buttons work
- [ ] GPS location works
- [ ] No ANR (App Not Responding) errors

### Database
- [ ] Check user_profiles table has users:
  ```sql
  SELECT COUNT(*) FROM user_profiles;
  ```
- [ ] Check sos_alerts table has alerts:
  ```sql
  SELECT COUNT(*) FROM sos_alerts;
  ```
- [ ] Check real-time is working:
  ```sql
  SELECT tablename FROM pg_publication_tables 
  WHERE pubname = 'supabase_realtime';
  ```

---

## Monitoring & Maintenance

### Daily Checks
- [ ] Check Supabase dashboard for errors
- [ ] Monitor API usage
- [ ] Check for failed queries
- [ ] Review activity logs

### Weekly Checks
- [ ] Review user signups
- [ ] Check SOS alert trends
- [ ] Monitor hospital capacity updates
- [ ] Review department usage

### Monthly Checks
- [ ] Update dependencies: `npm outdated`
- [ ] Security audit: `npm audit`
- [ ] Review and optimize database
- [ ] Check storage usage
- [ ] Review analytics

---

## Rollback Plan

### If deployment fails:
1. Check GitHub Actions logs
2. Check browser console for errors
3. Verify Supabase connection
4. Roll back to previous commit:
   ```bash
   git revert HEAD
   git push origin main
   ```

### If database issues:
1. Check Supabase logs
2. Verify RLS policies
3. Re-run setup SQL if needed
4. Check for breaking schema changes

### Emergency Contact
- Supabase Status: https://status.supabase.com
- GitHub Status: https://www.githubstatus.com

---

## Success Criteria

✅ **Deployment is successful when:**
- [ ] App is accessible at public URL
- [ ] Users can sign up and login
- [ ] SOS alerts save to Supabase
- [ ] Department dashboard shows real data
- [ ] Real-time updates work
- [ ] All CRUD operations work
- [ ] No critical errors in logs
- [ ] App is responsive on mobile
- [ ] App works on multiple browsers
- [ ] Android app installs and runs (if applicable)

---

## Resources

- **App URL**: `https://YOUR_USERNAME.github.io/bantayalert`
- **Repository**: `https://github.com/YOUR_USERNAME/bantayalert`
- **Supabase Dashboard**: https://app.supabase.com/project/gzefyknnjlsjmcgndbfn
- **Documentation**: See README.md and COMPLETE_SETUP_GUIDE.md

---

**Deployment Date**: ________________
**Deployed By**: ________________
**Version**: 1.0
**Status**: ☐ Web ☐ Android ☐ Both
