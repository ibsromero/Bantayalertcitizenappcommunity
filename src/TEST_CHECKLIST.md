# BantayAlert - Complete Test Checklist

## ✅ Pre-Testing Setup

### 1. Supabase Database Setup
- [ ] Run `COMPLETE_SUPABASE_SETUP.sql` in Supabase SQL Editor
- [ ] Verify all 10 tables created successfully
- [ ] Check that sample hospitals and evacuation centers are inserted

### 2. Email Confirmation Disabled
- [ ] Go to Supabase Dashboard → Authentication → Settings
- [ ] Confirm "Confirm email" is toggled OFF
- [ ] Save changes

### 3. Real-time Enabled
- [ ] Go to Database → Replication
- [ ] Verify all tables have realtime enabled
- [ ] Check `supabase_realtime` publication includes all tables

---

## 🧪 Citizen Side Tests

### Sign Up & Login
- [ ] Click "Sign In" button
- [ ] Go to "Sign Up" tab
- [ ] Enter: Name, Email, Password (min 6 chars)
- [ ] Click "Sign Up"
- [ ] **EXPECTED**: Login immediately without email verification
- [ ] **VERIFY**: User profile appears in `user_profiles` table in Supabase

### Emergency Contacts
- [ ] Navigate to Emergency Contacts tab
- [ ] Click "Add Contact"
- [ ] Fill in contact details
- [ ] Click "Save Contact"
- [ ] **EXPECTED**: Contact appears in list
- [ ] **VERIFY**: Contact saved in `emergency_contacts` table
- [ ] Edit contact - update name/phone
- [ ] **VERIFY**: Changes saved to database
- [ ] Delete contact
- [ ] **VERIFY**: Contact removed from database

### Emergency Kit
- [ ] Navigate to Emergency Kit tab
- [ ] Note current "Family Members" count (default: 4)
- [ ] Click "Add Item" in any category
- [ ] Fill in:
  - Item Name: "Test Bottled Water"
  - Quantity: "3"
  - Status: "Ready"
  - Priority: "High"
  - ✅ Check "Scale quantity per family member"
- [ ] Click "Save"
- [ ] **EXPECTED**: Item appears with suggested quantity "12" (3 × 4 family members)
- [ ] Change "Family Members" to 6
- [ ] **EXPECTED**: Suggested quantity updates to "18" (3 × 6)
- [ ] Hover over the new item
- [ ] **EXPECTED**: Trash icon appears
- [ ] Click trash icon
- [ ] **EXPECTED**: Item is removed
- [ ] **VERIFY**: Changes sync to localStorage and Supabase

### SOS Alert (Not Logged In)
- [ ] Logout (click profile icon → Logout)
- [ ] Click red "SEND SOS ALERT" button
- [ ] Fill in:
  - Name: "Test User"
  - Email: "test@example.com"
  - Phone: "09123456789"
  - Emergency: "Test emergency situation"
- [ ] Click "Get Current Location" (allow permission if prompted)
- [ ] Click "Send SOS Alert"
- [ ] **EXPECTED**: Success message appears
- [ ] **VERIFY**: Alert saved in `sos_alerts` table in Supabase:
  ```sql
  SELECT * FROM sos_alerts ORDER BY created_at DESC LIMIT 1;
  ```
- [ ] Note the alert ID for next test

### SOS Alert (Logged In)
- [ ] Login as citizen account
- [ ] Click "SEND SOS ALERT"
- [ ] **EXPECTED**: Name/Email pre-filled
- [ ] Send another alert with different message
- [ ] **VERIFY**: Alert saved with `user_id` populated

### Preparation Checklist
- [ ] Go to Preparation Checklist tab
- [ ] Select a disaster type (e.g., "Earthquake")
- [ ] Check off several items
- [ ] **EXPECTED**: Progress bar updates
- [ ] **VERIFY**: Progress saved to Supabase

---

## 🏛️ Department Side Tests

### Department Login
- [ ] Logout from citizen account
- [ ] Click "Sign In"
- [ ] Select "Department" tab
- [ ] Login with: responder@bantayalert.ph / RESPONDER@NCR2024
- [ ] **EXPECTED**: Department dashboard loads

### View SOS Alerts
- [ ] Dashboard should default to SOS Alerts section
- [ ] **EXPECTED**: See the SOS alerts created in previous tests
- [ ] **VERIFY**: Alerts match those in `sos_alerts` table
- [ ] Check alert details:
  - Citizen name visible
  - Contact info visible
  - Location visible
  - Emergency message visible
  - Status is "active"

### Update SOS Alert Status
- [ ] Click on an "Active" SOS alert
- [ ] Change status to "Responding"
- [ ] Click "Update Status"
- [ ] **EXPECTED**: Status updates immediately
- [ ] **VERIFY**: Status updated in Supabase:
  ```sql
  SELECT id, user_name, status FROM sos_alerts ORDER BY created_at DESC LIMIT 5;
  ```

### Disaster Monitoring
- [ ] Click "Disaster Monitoring" in sidebar
- [ ] **EXPECTED**: View active disasters (from sample data)
- [ ] **VERIFY**: Data loads from `disasters` table

### Healthcare Integration
- [ ] Click "Healthcare" in sidebar
- [ ] **EXPECTED**: See 8 hospitals with capacity info
- [ ] **VERIFY**: Hospitals match `hospitals` table
- [ ] Click "Call" button on any hospital
- [ ] **EXPECTED**: Phone dialer opens (if on mobile) or shows number (if on web)
- [ ] Click "Update Capacity" on any hospital
- [ ] Change available beds
- [ ] Click "Update"
- [ ] **EXPECTED**: Capacity updates

### Emergency Map
- [ ] Click "Emergency Map" in sidebar
- [ ] **EXPECTED**: Map loads with SOS alert markers
- [ ] **VERIFY**: Markers correspond to alerts in database

### Data Analytics
- [ ] Click "Data Analytics" in sidebar
- [ ] **EXPECTED**: See charts and statistics
- [ ] **VERIFY**: Stats reflect actual database data

---

## 🔄 Real-Time Tests

### Test 1: SOS Alert Real-Time
1. **Setup**: Open two browser windows side-by-side
2. **Window 1**: Department dashboard (SOS Alerts section)
3. **Window 2**: Citizen view (logged out is fine)
4. **Window 2**: Send a new SOS alert
5. **Window 1**: **EXPECTED**: New alert appears automatically (within 1-5 seconds)
6. **VERIFY**: No page refresh needed

### Test 2: Hospital Update Real-Time
1. **Setup**: Two windows, both on Department dashboard
2. **Window 1**: Healthcare section
3. **Window 2**: Healthcare section
4. **Window 1**: Update a hospital's bed capacity
5. **Window 2**: **EXPECTED**: Capacity updates automatically

### Test 3: Cross-User Real-Time
1. **Setup**: Open app on two different devices/browsers
2. **Device 1**: Department account logged in
3. **Device 2**: Citizen account logged in
4. **Device 2**: Send SOS alert
5. **Device 1**: **EXPECTED**: Alert appears on department dashboard

---

## 📱 Android Tests (If Deployed)

### Installation
- [ ] Build APK following COMPLETE_SETUP_GUIDE.md Part 6
- [ ] Install on Android device
- [ ] **EXPECTED**: App launches without errors

### Core Functions
- [ ] Test signup/login
- [ ] Test SOS alert with GPS location
- [ ] Test calling emergency contacts
- [ ] Test calling hospitals
- [ ] **VERIFY**: All functions work same as web version

### Permissions
- [ ] App requests location permission
- [ ] App requests phone permission (for calling)
- [ ] Permissions work correctly when granted/denied

---

## 🐛 Known Issues to Watch For

### ❌ What Should NOT Happen:
- [ ] "Demo mode" login without valid credentials (FIXED)
- [ ] SOS alerts only stored locally (FIXED - now saves to Supabase)
- [ ] Can't delete emergency kit items (FIXED - delete button added)
- [ ] Family size doesn't update quantities (FIXED - updates dynamically)
- [ ] Email verification required (FIXED - disabled in settings)

### ✅ What SHOULD Happen:
- [ ] Invalid login shows error message
- [ ] SOS alerts save to Supabase immediately
- [ ] Emergency kit items can be deleted
- [ ] Quantities update when family size changes
- [ ] Login works immediately after signup

---

## 📊 Database Verification Queries

### Check All Tables Have Data:
```sql
SELECT 
  'user_profiles' as table_name, COUNT(*) as rows FROM user_profiles
UNION ALL
SELECT 'emergency_contacts', COUNT(*) FROM emergency_contacts
UNION ALL
SELECT 'sos_alerts', COUNT(*) FROM sos_alerts
UNION ALL
SELECT 'hospitals', COUNT(*) FROM hospitals
UNION ALL
SELECT 'disasters', COUNT(*) FROM disasters
UNION ALL
SELECT 'evacuation_centers', COUNT(*) FROM evacuation_centers;
```

### Check Recent SOS Alerts:
```sql
SELECT 
  id,
  user_name,
  user_email,
  contact_number,
  details,
  status,
  priority,
  created_at
FROM sos_alerts
ORDER BY created_at DESC
LIMIT 10;
```

### Check User Profiles:
```sql
SELECT 
  user_id,
  name,
  email,
  phone_number,
  created_at
FROM user_profiles
ORDER BY created_at DESC;
```

### Check Real-Time Publication:
```sql
SELECT 
  schemaname,
  tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;
```

---

## 🎯 Success Criteria

### Minimum Requirements:
- ✅ All 10 database tables created
- ✅ Users can sign up and login
- ✅ SOS alerts save to Supabase
- ✅ Department can view SOS alerts
- ✅ Emergency kit functions work (add, edit, delete)
- ✅ Real-time updates work for SOS alerts

### Full Functionality:
- ✅ All citizen features functional
- ✅ All department features functional
- ✅ Real-time works across all tables
- ✅ Android build successful (if deploying mobile)
- ✅ No console errors
- ✅ Data persists across sessions

---

## 📝 Test Results

Record your test results:

**Date**: _________________

**Tester**: _________________

**Environment**: [ ] Web [ ] Android [ ] Both

**Database Setup**: [ ] Pass [ ] Fail

**Citizen Features**: [ ] Pass [ ] Fail

**Department Features**: [ ] Pass [ ] Fail

**Real-Time Updates**: [ ] Pass [ ] Fail

**Android Build**: [ ] Pass [ ] Fail [ ] N/A

**Issues Found**:
_______________________________________________
_______________________________________________
_______________________________________________

**Overall Status**: [ ] ✅ All Tests Pass [ ] ⚠️ Minor Issues [ ] ❌ Major Issues
