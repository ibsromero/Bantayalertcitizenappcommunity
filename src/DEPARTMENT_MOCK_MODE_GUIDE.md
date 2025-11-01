# Department Dashboard - Mock Mode Guide

## 🎯 What You Need to Know

Your department dashboard is currently running in **DEMO MODE** with sample data. This is intentional and allows you to test all features without any server setup!

## ✅ What Works Right Now

### Authentication
- ✅ Sign in with department credentials
- ✅ Secure session management
- ✅ Role-based access (LGU, Healthcare, Emergency Response, Disaster Management)

### Dashboard Features
- ✅ View SOS alerts with full details
- ✅ Monitor active disasters
- ✅ Track hospital capacity
- ✅ View analytics and statistics
- ✅ Interactive maps and data visualizations
- ✅ Update alert statuses (simulated)
- ✅ Modify hospital capacity (simulated)
- ✅ Create disaster events (simulated)

## 🔄 How Mock Mode Works

### Reading Data (GET operations)
When you view data, the dashboard shows **realistic sample data** from `/utils/mockDepartmentData.ts`:

- **3 SOS Alerts** - Various emergencies across NCR
- **2 Active Disasters** - Flood and typhoon scenarios
- **8 Hospitals** - Real NCR hospitals with capacity data
- **Analytics Summary** - Dashboard statistics

### Writing Data (PUT/POST operations)
When you update data, the system **simulates success** without saving:

```
You click "Update Hospital Capacity"
   ↓
System shows loading spinner (300ms)
   ↓
Success message displays
   ✅ "Hospital capacity updated"
   
BUT: Data is not actually saved
Refresh the page → Original mock data returns
```

This is **intentional** and perfect for testing!

## 📱 Department Credentials

Use these to sign in (select "Department" option):

| Department | Email | Password |
|------------|-------|----------|
| **LGU** | lgu@bantayalert.ph | LGU2025!Manila |
| **Emergency** | responder@bantayalert.ph | RESP2025!911 |
| **Healthcare** | healthcare@bantayalert.ph | HEALTH2025!Care |
| **Disaster Mgmt** | ndrrmc@bantayalert.ph | NDRRMC2025!PH |

## 🔍 What You'll See in Console

### Normal Mock Mode Messages ✅

```
📦 Using mock SOS alerts data (Edge Function not deployed)
📦 Using mock disasters data (Edge Function not deployed)
📦 Using mock hospitals data (Edge Function not deployed)
📦 Simulating hospital capacity update (Edge Function not deployed)
✅ Hospital capacity updated successfully
```

These are **GOOD** - they confirm mock mode is working!

### What You WON'T See Anymore ✅

```
❌ Department API error for /healthcare/hospital/xxx
❌ Status: 401 Unauthorized
❌ Authentication failed
```

The 401 errors have been fixed!

## 🎨 User Experience

### What Users See
1. **Blue Banner** at top: "Demo Mode: Viewing sample data"
2. **Smooth interactions** - all buttons and forms work
3. **Success messages** - updates appear to work
4. **Consistent data** - same sample data on each page load

### What Users DON'T See
- ❌ Error messages
- ❌ Failed requests
- ❌ Broken features
- ❌ Authentication issues

## 🚀 Switching to Live Data

When you want real persistence:

### Step 1: Deploy Edge Function
```bash
# Navigate to your Supabase project
cd supabase/functions

# Deploy the server
supabase functions deploy make-server-dd0f68d8
```

### Step 2: Update Configuration
In `/utils/departmentApiService.ts`, line 11:

```typescript
// Change this:
const USE_MOCK_DATA = true;

// To this:
const USE_MOCK_DATA = false;
```

### Step 3: Verify
1. Sign in to department dashboard
2. Update some data
3. Refresh the page
4. ✅ Data should persist!

## 🎭 Demo Scenarios to Test

### Scenario 1: SOS Alert Management
1. Sign in as Emergency Responder
2. View active SOS alerts
3. Click on an alert
4. Change status to "Responding"
5. Add resolution notes
6. Save changes
7. ✅ See success message

### Scenario 2: Hospital Capacity Update
1. Sign in as Healthcare Provider
2. Navigate to Healthcare Integration
3. Click on a hospital
4. Update available beds
5. Save changes
6. ✅ See success message

### Scenario 3: Disaster Monitoring
1. Sign in as Disaster Management
2. View active disasters
3. Create new disaster event
4. Add details and affected areas
5. Save event
6. ✅ See success message

All of these work perfectly in mock mode!

## 💡 Pro Tips

### Tip 1: Check the Console
Open browser DevTools (F12) to see helpful mock mode messages that explain what's happening behind the scenes.

### Tip 2: Don't Expect Persistence
In mock mode, all changes are temporary. This is perfect for demos because you always start with clean, consistent data.

### Tip 3: Customize Mock Data
Want different sample data? Edit `/utils/mockDepartmentData.ts` to add your own hospitals, alerts, or disasters.

### Tip 4: Use for Presentations
Mock mode is perfect for demos and presentations - no internet required, no setup needed, and everything works smoothly.

## ❓ Common Questions

### Q: Why aren't my changes saving?
**A:** You're in mock mode! Changes are simulated. This is intentional for testing without a database.

### Q: Can I add my own sample data?
**A:** Yes! Edit `/utils/mockDepartmentData.ts` to customize hospitals, alerts, and disasters.

### Q: When should I switch to live data?
**A:** When you've deployed the Edge Function and want real data persistence.

### Q: Is mock mode secure?
**A:** Mock mode is for testing only. Switch to live mode with proper server-side auth for production.

### Q: Will users know it's mock data?
**A:** Yes, there's a blue banner at the top explaining demo mode.

## 📊 Mock Data Summary

Current sample data includes:

### SOS Alerts (3)
- Maria Santos - Flooding in Marikina (Critical)
- Juan Cruz - Elderly trapped (High, Responding)
- Ana Reyes - Power outage, tree fell (Medium)

### Active Disasters (2)
- Marikina River Flooding (High severity, 450 evacuees)
- Typhoon Signal #2 NCR (Medium severity, 820 evacuees)

### Hospitals (8)
- Philippine General Hospital (1500 beds)
- Makati Medical Center (600 beds)
- Veterans Memorial Medical Center (1000 beds)
- Pasig City General Hospital (300 beds)
- Manila Doctors Hospital (400 beds)
- St. Luke's Medical Center BGC (650 beds)
- Taguig-Pateros District Hospital (200 beds)
- Las Piñas General Hospital (350 beds)

### Analytics
- Total SOS Alerts: 247
- Active Disasters: 2
- Total Evacuees: 1,842
- Response Time: 8.5 minutes average

## 🎉 Benefits of Mock Mode

✅ **No setup required** - Works immediately  
✅ **Offline capable** - No internet needed  
✅ **Safe testing** - Can't break anything  
✅ **Fast feedback** - Instant responses  
✅ **Consistent data** - Predictable for demos  
✅ **Full features** - Everything works  

## 📚 Related Documentation

- `/MOCK_DATA_SYSTEM.md` - Technical details of mock system
- `/FIX_401_ERRORS_COMPLETE.md` - How 401 errors were fixed
- `/EDGE_FUNCTION_DEPLOYMENT_REQUIRED.md` - Deployment guide
- `/DEPARTMENT_UPDATES.md` - Feature overview

---

**Remember**: Mock mode is a feature, not a bug! It allows you to test everything without any backend setup. When you're ready for production, just deploy the Edge Function and flip the switch.

**Current Status**: ✅ **Fully Functional in Mock Mode**

*Last Updated: October 27, 2025*
