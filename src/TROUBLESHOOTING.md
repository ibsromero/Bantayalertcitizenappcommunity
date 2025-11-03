# BantayAlert - Troubleshooting Guide

## 🔧 Common Issues & Solutions

### 1. "Please check your email to verify"

**Problem**: Can't login immediately after signup.

**Solution**:
1. Go to [Supabase Dashboard](https://app.supabase.com/project/gzefyknnjlsjmcgndbfn)
2. Navigate to **Authentication** → **Settings**
3. Scroll to **Email Auth Settings**
4. **Toggle OFF** "Confirm email"
5. Click **Save**
6. Try signing up again

---

### 2. SOS Alerts Not Showing on Department Dashboard

**Problem**: Citizen sends SOS alert but department doesn't see it.

**Solution**:
1. Verify database setup:
   ```sql
   SELECT COUNT(*) FROM sos_alerts;
   ```
2. Check RLS policies:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'sos_alerts';
   ```
3. Ensure real-time is enabled:
   - Go to **Database** → **Replication**
   - Verify `sos_alerts` has realtime enabled

---

### 3. Can't Delete Items from Emergency Kit

**Problem**: Delete button not visible.

**Solution**:
- **Hover over the item** to reveal the trash icon
- Works on desktop (mouse hover) and mobile (tap and hold)
- If still not working, clear browser cache and reload

---

### 4. Family Size Doesn't Update Quantities

**Problem**: Changing family members doesn't affect item quantities.

**Solution**:
- When adding items, check the **"Scale quantity per family member"** checkbox
- Only items with this checkbox will scale
- Existing items without this property won't scale automatically
- Solution: Delete and re-add items with the checkbox enabled

---

### 5. Department Login Not Working

**Problem**: Can't login with department credentials.

**Solution**:
1. Verify you're using correct credentials:
   - LGU: lgu@bantayalert.ph / LGU@NCR2024
   - Responder: responder@bantayalert.ph / RESPONDER@NCR2024
   - Healthcare: healthcare@bantayalert.ph / HEALTHCARE@NCR2024
   - NDRRMC: ndrrmc@bantayalert.ph / NDRRMC@NCR2024

2. Make sure to select **"Department"** tab (not Citizen)
3. Clear browser cache and try again
4. Check browser console for errors

---

### 6. User Signup Not Saving to Database

**Problem**: Created account but can't see in `user_profiles` table.

**Solution**:
1. Run the complete database setup:
   ```sql
   -- In Supabase SQL Editor, run COMPLETE_SUPABASE_SETUP.sql
   ```
2. Verify `user_profiles` table exists:
   ```sql
   SELECT * FROM user_profiles;
   ```
3. Check Supabase logs for errors:
   - Dashboard → **Logs** → **Database**

---

### 7. Real-time Updates Not Working

**Problem**: Changes don't appear automatically, need to refresh page.

**Solution**:
1. Enable real-time in Supabase:
   ```sql
   -- Check if tables are in realtime publication
   SELECT tablename FROM pg_publication_tables 
   WHERE pubname = 'supabase_realtime';
   ```

2. If missing, add tables to realtime:
   ```sql
   ALTER PUBLICATION supabase_realtime ADD TABLE sos_alerts;
   ALTER PUBLICATION supabase_realtime ADD TABLE hospitals;
   ALTER PUBLICATION supabase_realtime ADD TABLE disasters;
   ```

3. Check browser console for subscription errors

---

### 8. Build Errors (npm run build)

**Problem**: Build fails with errors.

**Solution**:
```bash
# Clear cache
rm -rf node_modules dist .vite

# Reinstall dependencies
npm install

# Try build again
npm run build
```

If still failing:
- Check Node.js version: `node --version` (should be 16+)
- Update npm: `npm install -g npm@latest`
- Check for syntax errors in console output

---

### 9. Android Build Errors

**Problem**: Capacitor or Android Studio errors.

**Solution**:
1. **"capacitor.config.json not found"**:
   ```bash
   npx cap init
   # Enter app name and package ID
   ```

2. **"Build failed" in Android Studio**:
   - File → **Invalidate Caches / Restart**
   - Clean Project: **Build** → **Clean Project**
   - Rebuild: **Build** → **Rebuild Project**

3. **"SDK not found"**:
   - Tools → **SDK Manager**
   - Install Android SDK 30+
   - Set ANDROID_HOME environment variable

4. **Gradle errors**:
   - Update `android/build.gradle`
   - Sync Gradle files
   - Check internet connection (Gradle downloads dependencies)

---

### 10. Location/GPS Not Working

**Problem**: "Get Current Location" doesn't work.

**Solution**:
1. **Browser**: Grant location permission when prompted
2. **Android**: Add permissions to `AndroidManifest.xml`:
   ```xml
   <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
   <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
   ```
3. Enable location services on device
4. Use HTTPS (HTTP doesn't support geolocation)

---

### 11. Phone Calls Not Working

**Problem**: "Call" buttons do nothing.

**Solution**:
1. **Web**: Calls open default phone app or dialer
2. **Android**: Add permission:
   ```xml
   <uses-permission android:name="android.permission.CALL_PHONE" />
   ```
3. Some browsers block `tel:` links - use mobile device
4. Check browser console for blocked popups

---

### 12. Data Not Persisting

**Problem**: Data disappears after refresh.

**Solution**:
1. Check if logged in (guest data only saved locally)
2. Verify Supabase connection:
   ```javascript
   // In browser console
   console.log(supabase)
   ```
3. Check localStorage:
   ```javascript
   // In browser console
   console.log(localStorage)
   ```
4. Clear cookies/cache if localStorage is full
5. Ensure RLS policies allow INSERT/UPDATE

---

### 13. "Invalid token format" Error

**Problem**: Department users see token error banner.

**Solution**:
1. Click "Clear Tokens" button
2. Sign out completely
3. Clear browser cache
4. Sign in again
5. Token will be regenerated

---

### 14. Database Connection Timeout

**Problem**: "Failed to connect to database" errors.

**Solution**:
1. Check Supabase status: https://status.supabase.com
2. Verify project is not paused:
   - Supabase Dashboard → Project Settings
   - Check "Project Status"
3. Check API keys in `/utils/supabase/info.tsx`:
   - `projectId` should be `gzefyknnjlsjmcgndbfn`
   - `publicAnonKey` should be valid (starts with `eyJ`)
4. Test connection:
   ```sql
   SELECT NOW(); -- Should return current timestamp
   ```

---

### 15. GitHub Pages Deployment Issues

**Problem**: App not loading on GitHub Pages.

**Solution**:
1. Check GitHub Actions:
   - Go to **Actions** tab
   - Verify build succeeded (green checkmark)
2. Enable GitHub Pages:
   - Settings → Pages
   - Source: `gh-pages` branch
3. Check `base` in `vite.config.ts`:
   ```typescript
   base: '/repo-name/'  // Add your repo name
   ```
4. Wait 5-10 minutes for deployment to propagate

---

## 🐛 Debugging Tips

### Enable Verbose Logging:
```javascript
// In browser console
localStorage.setItem('DEBUG', 'true');
```

### Check Supabase Connection:
```javascript
// In browser console
const { data, error } = await supabase.from('user_profiles').select('*').limit(1);
console.log({ data, error });
```

### Monitor Real-time:
```javascript
// In browser console
supabase
  .channel('debug')
  .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
    console.log('Real-time change:', payload);
  })
  .subscribe();
```

### Clear All Data (Fresh Start):
```javascript
// In browser console
localStorage.clear();
sessionStorage.clear();
location.reload();
```

---

## 📞 Still Having Issues?

1. **Check Browser Console**:
   - Press F12 or Ctrl+Shift+I
   - Look for red errors
   - Copy error message

2. **Check Supabase Logs**:
   - Dashboard → **Logs**
   - Check for failed queries

3. **Test Database Connection**:
   - Run queries in SQL Editor
   - Verify data exists

4. **Create Issue on GitHub**:
   - Include:
     - Error message (full text)
     - Browser and version
     - Steps to reproduce
     - Screenshots if applicable

---

## ✅ Verification Commands

```sql
-- Check all tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' ORDER BY table_name;

-- Check SOS alerts
SELECT COUNT(*), status FROM sos_alerts GROUP BY status;

-- Check user profiles
SELECT COUNT(*) FROM user_profiles;

-- Check real-time publication
SELECT tablename FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';

-- Check RLS policies
SELECT tablename, policyname, cmd FROM pg_policies 
WHERE schemaname = 'public' ORDER BY tablename;
```

---

**Last Updated**: November 3, 2025
