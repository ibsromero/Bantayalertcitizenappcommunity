# Mock Data System - Quick Reference

## Overview

The BantayAlert department dashboard currently runs in **Demo Mode** with mock (sample) data. This allows you to test all features without deploying server infrastructure.

## Current Status ✅

- ✅ **Department Authentication**: Working with client-side validation
- ✅ **All Read Operations**: Return mock data (SOS alerts, disasters, hospitals, analytics)
- ✅ **All Write Operations**: Simulate success without actually saving data
- ✅ **No 401 Errors**: All API calls handle mock mode gracefully

## How It Works

### Mock Data Flag

In `/utils/departmentApiService.ts`, line 11:

```typescript
const USE_MOCK_DATA = true; // Set to false when Edge Function is deployed
```

When `USE_MOCK_DATA = true`:
- All **read operations** return sample data from `/utils/mockDepartmentData.ts`
- All **write operations** simulate success without calling the server
- No actual database updates occur
- Perfect for testing and demonstration

### What Gets Simulated

**Read Operations (return mock data):**
- `getSOSAlerts()` - Sample SOS emergency alerts
- `getActiveDisasters()` - Sample disaster events
- `getHospitals()` - Sample hospital capacity data
- `getAnalyticsSummary()` - Sample analytics dashboard data

**Write Operations (simulate success):**
- `updateSOSAlert()` - Simulates updating alert status
- `createDisasterEvent()` - Simulates creating disaster event
- `updateDisasterEvent()` - Simulates updating disaster
- `updateHospitalCapacity()` - Simulates hospital capacity update

## Switching to Live Data

When you're ready to connect to real Supabase backend:

### Step 1: Deploy Edge Function

Deploy the server code in `/supabase/functions/server/` to Supabase Edge Functions:

```bash
supabase functions deploy make-server-dd0f68d8
```

### Step 2: Update Mock Data Flag

In `/utils/departmentApiService.ts`, change line 11:

```typescript
const USE_MOCK_DATA = false; // Now using live Edge Function
```

### Step 3: Test Connection

1. Sign in to department dashboard
2. Check browser console for API responses
3. Verify data persistence across refreshes

## Mock Data Location

All mock data is defined in `/utils/mockDepartmentData.ts`:

- `MOCK_SOS_ALERTS` - 3 sample SOS alerts
- `MOCK_ACTIVE_DISASTERS` - 2 sample disaster events  
- `MOCK_HOSPITALS` - 8 NCR hospitals with capacity data
- `MOCK_ANALYTICS_SUMMARY` - Dashboard summary statistics

You can edit this file to customize the sample data for your testing needs.

## Department Credentials

Currently using client-side authentication with these credentials:

| Department | Email | Password |
|------------|-------|----------|
| LGU | lgu@bantayalert.ph | LGU2025!Manila |
| Emergency Responder | responder@bantayalert.ph | RESP2025!911 |
| Healthcare | healthcare@bantayalert.ph | HEALTH2025!Care |
| Disaster Management | ndrrmc@bantayalert.ph | NDRRMC2025!PH |

⚠️ **Security Note**: Client-side authentication is for prototype/demo only. The Edge Function includes proper server-side validation.

## Benefits of Mock Mode

✅ **No Deployment Required** - Test immediately without infrastructure  
✅ **Offline Testing** - Works without internet connection  
✅ **Safe Experimentation** - No risk of corrupting real data  
✅ **Fast Iteration** - Instant feedback without API latency  
✅ **Predictable Data** - Consistent sample data for testing  

## Troubleshooting

### Still Getting 401 Errors?

Make sure:
1. `USE_MOCK_DATA = true` in `/utils/departmentApiService.ts`
2. You've signed out and signed back in to get a fresh token
3. Clear browser cache and reload

### Updates Not Persisting?

This is expected in mock mode! Updates are simulated but not saved. The mock data resets on page refresh. This is the intended behavior for demo mode.

### Want Real Persistence?

Follow the "Switching to Live Data" steps above to deploy the Edge Function and connect to Supabase.

## Related Files

- `/utils/departmentApiService.ts` - API service with mock mode logic
- `/utils/mockDepartmentData.ts` - Sample data definitions
- `/utils/clientSideDepartmentAuth.ts` - Client-side auth for demo
- `/supabase/functions/server/index.tsx` - Server-side Edge Function
- `/components/MockDataBanner.tsx` - Banner shown in demo mode

## Questions?

Check these guides:
- `EDGE_FUNCTION_DEPLOYMENT_REQUIRED.md` - How to deploy server
- `SUPABASE_SETUP_GUIDE.md` - Complete Supabase setup
- `DEPARTMENT_UPDATES.md` - Department system overview
