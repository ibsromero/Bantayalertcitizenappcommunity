# 🚀 BantayAlert Real-Time Setup Guide

## Overview

This guide will help you set up the fully functional real-time BantayAlert system with bidirectional communication between citizens and departments - **NO MOCK DATA, NO PROTOTYPES**.

## What You're Building

✅ **Real-time SOS Alerts**: Citizens send SOS → Departments receive instantly  
✅ **Real-time Weather Warnings**: Departments send alerts → Citizens receive instantly  
✅ **Live Hospital Capacity**: Healthcare providers update → Everyone sees latest data  
✅ **Live Disaster Monitoring**: Departments track disasters in real-time  
✅ **Live Analytics Dashboard**: Auto-updating statistics for departments  
✅ **Department Authentication**: Separate login system for LGUs, emergency responders, healthcare, and disaster management

## 🎯 Step-by-Step Setup

### Step 1: Run the Database Setup SQL

1. Open your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New query**
5. Open the file `/SUPABASE_REALTIME_SETUP.sql` in this project
6. Copy the ENTIRE contents and paste into the SQL Editor
7. Click **Run** to execute

**What this creates:**
- ✅ `sos_alerts` table - For citizen SOS alerts
- ✅ `disaster_events` table - For active disasters
- ✅ `hospitals` table - For hospital capacity tracking
- ✅ `weather_warnings` table - For department-to-citizen alerts
- ✅ `department_users` table - For department authentication
- ✅ `analytics_summary` table - For dashboard statistics
- ✅ Automatic triggers to keep data updated
- ✅ Sample department accounts (Manila LGU, Quezon City LGU, BFP, PGH, NDRRMC)
- ✅ Sample hospital data for NCR

### Step 2: Enable Realtime in Supabase

1. In your Supabase Dashboard, go to **Database** → **Replication**
2. Find and enable realtime for these tables:
   - ✅ `sos_alerts`
   - ✅ `disaster_events`
   - ✅ `weather_warnings`
   - ✅ `hospitals`
   - ✅ `analytics_summary`

**How to enable:**
- Find each table in the list
- Toggle the switch to **ON** (it will turn green)
- This allows real-time subscriptions to work

### Step 3: Update Your Code to Use Real-Time Service

The new service is already created at `/utils/realtimeDepartmentService.ts`.

**Key changes needed in your components:**

#### For SOS Button (Citizen Side):
```typescript
// Replace the old API call with:
import { createSOSAlert } from "../utils/realtimeDepartmentService";

// When citizen clicks SOS:
const result = await createSOSAlert({
  userEmail: user.email,
  userName: user.name,
  location: { lat: 14.5995, lng: 120.9842, address: "Manila" },
  details: "Emergency help needed!",
  contactNumber: "+63 912 345 6789"
});
```

#### For Department Dashboard:
```typescript
import { 
  getSOSAlerts, 
  subscribeToSOSAlerts,
  getActiveDisasters,
  getAnalyticsSummary,
  subscribeToAnalytics
} from "../utils/realtimeDepartmentService";

// Load data
const { alerts } = await getSOSAlerts("active");
const { disasters } = await getActiveDisasters();
const analytics = await getAnalyticsSummary();

// Subscribe to real-time updates
const sosChannel = subscribeToSOSAlerts((payload) => {
  console.log("New SOS alert!", payload);
  // Update UI with new alert
});

// Cleanup on unmount
return () => {
  sosChannel.unsubscribe();
};
```

### Step 4: Set Up Department Passwords

The SQL script includes sample department accounts, but they need proper passwords.

**Option A: Simple Setup (for testing)**
Update the department authentication function to check against hardcoded passwords.

**Option B: Production Setup**
1. Install bcrypt: `npm install bcrypt`
2. Generate password hashes
3. Update the `department_users` table with hashed passwords
4. Update the authentication function to verify with bcrypt

**Default Department Accounts:**
```
Email: manila.lgu@bantayalert.ph
Password: (set your own)
Type: LGU

Email: quezon.lgu@bantayalert.ph
Password: (set your own)
Type: LGU

Email: bfp.ncr@bantayalert.ph
Password: (set your own)
Type: Emergency Responder

Email: pgh.healthcare@bantayalert.ph
Password: (set your own)
Type: Healthcare

Email: ndrrmc@bantayalert.ph
Password: (set your own)
Type: Disaster Management
```

### Step 5: Update Department Login Component

Replace the mock department login with real authentication:

```typescript
import { authenticateDepartment } from "../utils/realtimeDepartmentService";

async function handleDepartmentLogin(email: string, password: string) {
  const { user, token, error } = await authenticateDepartment(email, password);
  
  if (error) {
    alert("Login failed: " + error);
    return;
  }
  
  // Store token and user info
  localStorage.setItem("department_token", token);
  localStorage.setItem("department_user", JSON.stringify(user));
  
  // Redirect to department dashboard
  window.location.href = "/department";
}
```

## 🔄 How Real-Time Communication Works

### Citizen → Department (SOS Alerts)

1. **Citizen clicks SOS button**
   - App calls `createSOSAlert()`
   - Data is inserted into `sos_alerts` table

2. **Department receives instantly**
   - Department dashboard is subscribed to `sos_alerts` table
   - Supabase Realtime pushes update to all subscribed clients
   - New alert appears in department dashboard automatically

3. **Department responds**
   - Department updates alert status to "responding"
   - Citizen can see status update in real-time

### Department → Citizen (Weather Warnings)

1. **Department creates weather warning**
   - Department calls `createWeatherWarning()`
   - Data is inserted into `weather_warnings` table

2. **Citizens receive instantly**
   - Citizen apps subscribed to `weather_warnings` table
   - Supabase Realtime pushes new warning to all clients
   - Warning notification appears for affected citizens

3. **Citizens acknowledge**
   - Citizens can mark warnings as read
   - Department can see acknowledgment statistics

## 📊 Features Working Out of the Box

### ✅ SOS Alert System
- Citizens can send SOS with location
- Departments see all active alerts
- Real-time status updates
- Priority assignment
- Resolution tracking

### ✅ Disaster Monitoring
- Departments create disaster events
- Track affected areas
- Monitor casualties and evacuees
- Real-time updates across all departments

### ✅ Hospital Integration
- Live hospital capacity tracking
- Real-time bed availability
- ICU and emergency room status
- Hospital locator for citizens

### ✅ Weather Warnings
- Departments issue warnings
- Target specific areas
- Severity levels
- Automatic expiration

### ✅ Analytics Dashboard
- Auto-updating statistics
- Response time tracking
- Citizens helped counter
- Hospital capacity overview

## 🧪 Testing the System

### Test 1: SOS Alert Flow
1. Open citizen app (not logged in is OK for SOS)
2. Click SOS button
3. Fill in details and send
4. Open department dashboard in another tab
5. See alert appear instantly!

### Test 2: Weather Warning Flow
1. Login to department dashboard
2. Create a weather warning
3. Open citizen app in another tab
4. See warning appear on dashboard

### Test 3: Real-Time Updates
1. Open department dashboard in two browser tabs
2. In tab 1, update an SOS alert status
3. See tab 2 update automatically!

### Test 4: Hospital Capacity
1. Login as healthcare department
2. Update hospital bed availability
3. Open citizen app
4. Check hospital locator - see updated capacity

## 🔧 Troubleshooting

### Issue: Real-time not working
**Solution:** Make sure Realtime is enabled in Supabase Dashboard → Database → Replication

### Issue: 401 Unauthorized errors
**Solution:** Check that RLS policies are set up correctly (the SQL script does this)

### Issue: Department login fails
**Solution:** Verify department_users table has the accounts, or add them manually

### Issue: No data appearing
**Solution:** Check browser console for errors, verify Supabase connection

### Issue: Data not syncing
**Solution:** Check that you're subscribed to the correct tables

## 📱 Mobile Considerations

The real-time system works on mobile browsers too! For best results:
- Use HTTPS (Supabase provides this automatically)
- Handle connection drops gracefully
- Implement reconnection logic
- Test on actual devices

## 🔐 Security Notes

1. **Row Level Security (RLS)** is enabled on all tables
2. **Department authentication** should use proper password hashing in production
3. **API keys** are safe to expose (they're meant to be public)
4. **Realtime subscriptions** respect RLS policies
5. **No Edge Functions** required - everything goes through Supabase

## 🚀 Going to Production

Before going live:
1. ✅ Implement proper password hashing (bcrypt)
2. ✅ Add email verification for departments
3. ✅ Set up proper error logging
4. ✅ Configure Supabase production settings
5. ✅ Set up monitoring and alerts
6. ✅ Test thoroughly on mobile devices
7. ✅ Implement offline support
8. ✅ Add rate limiting if needed

## 📞 Integration with External Services

### PAGASA Weather API
Connect weather warnings to real PAGASA data:
```typescript
// Fetch from PAGASA, then create warning:
await createWeatherWarning({
  warningType: "typhoon",
  title: pagasaData.signal_name,
  description: pagasaData.description,
  severity: "critical",
  affectedAreas: pagasaData.affected_areas
});
```

### SMS Notifications
Integrate with SMS provider (e.g., Twilio, Semaphore):
```typescript
// When SOS alert is created, send SMS to authorities
subscribeToSOSAlerts(async (payload) => {
  if (payload.eventType === 'INSERT') {
    await sendSMS({
      to: EMERGENCY_NUMBER,
      message: `SOS Alert: ${payload.new.details}`
    });
  }
});
```

## 🎓 Next Steps

1. Run the SQL setup
2. Enable Realtime in Supabase
3. Update your components to use the new service
4. Test the SOS flow
5. Test weather warnings
6. Customize for your specific needs

## 🆘 Need Help?

Check these resources:
- Supabase Realtime Docs: https://supabase.com/docs/guides/realtime
- Supabase Row Level Security: https://supabase.com/docs/guides/auth/row-level-security
- BantayAlert Code: Check `/utils/realtimeDepartmentService.ts` for all available functions

---

**You're now ready to build a fully functional, real-time disaster preparedness system!** 🎉
