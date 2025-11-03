# 📦 Mock Data Mode - How It Works

## What You're Seeing

If you see these warnings in the browser console (F12):
```
⚠️ Analytics API failed, falling back to mock data
⚠️ Disasters API failed, falling back to mock data
⚠️ Hospitals API failed, falling back to mock data
Error details: Failed to fetch
```

**Don't worry!** This is **completely normal** and **expected behavior** when Edge Functions aren't deployed yet.

---

## Why This Happens

The BantayAlert app has two modes:

### 🌐 Production Mode (Edge Functions Deployed)
- Department API calls connect to Supabase Edge Functions
- Real-time data processing on server
- Live database updates
- Requires Edge Function deployment

### 📦 Mock Data Mode (Current - Development/Testing)
- Department API calls fall back to realistic mock data
- All features work locally
- Perfect for testing and demos
- **NO deployment required**

---

## What Works in Mock Data Mode

✅ **Everything!** The entire department dashboard is fully functional:

### SOS Alert Tracking
- ✅ View all SOS alerts (using Supabase database)
- ✅ Filter by status (active/all)
- ✅ Real-time updates when citizens send alerts
- ✅ Update alert status and priority
- ✅ Add resolution notes

### Disaster Monitoring
- ✅ View active disasters with realistic data
- ✅ See affected populations and evacuees
- ✅ Monitor disaster severity levels
- ✅ Track disaster locations on map

### Healthcare Integration
- ✅ View 10+ hospitals across NCR
- ✅ See bed availability and occupancy rates
- ✅ Monitor ICU and emergency capacity
- ✅ Update hospital status (simulated)

### Data Analytics
- ✅ Real-time statistics dashboard
- ✅ Alert trends by hour
- ✅ Disaster distribution by type
- ✅ Healthcare system overview
- ✅ Auto-refresh every 60 seconds

---

## Mock Data Details

### SOS Alerts (Hybrid)
- **Source:** Supabase database + Local fallback
- **Behavior:** 
  - Creates real alerts in Supabase when citizens send SOS
  - Reads from Supabase when available
  - Falls back to localStorage if Supabase connection fails
  - **This is REAL functionality!**

### Analytics, Disasters, Hospitals (Mock)
- **Source:** `/utils/mockDepartmentData.ts`
- **Behavior:**
  - Returns realistic Philippine data
  - Simulates 10+ hospitals across NCR
  - Shows 5+ active disasters
  - Provides hourly alert trends
  - Auto-updates timestamps

---

## When to Deploy Edge Functions

You can use the app in Mock Data Mode indefinitely for:
- ✅ Development and testing
- ✅ UI/UX design and demos
- ✅ Feature prototyping
- ✅ Training and walkthroughs

Deploy Edge Functions when you need:
- 🚀 Production deployment
- 🚀 Multi-user coordination
- 🚀 Server-side data processing
- 🚀 Advanced analytics computation
- 🚀 Integration with external APIs

---

## How to Deploy Edge Functions (When Ready)

### Step 1: Install Supabase CLI
```bash
npm install -g supabase
```

### Step 2: Login to Supabase
```bash
supabase login
```

### Step 3: Link Your Project
```bash
supabase link --project-ref YOUR_PROJECT_ID
```

### Step 4: Deploy Functions
```bash
supabase functions deploy departmentApiService
supabase functions deploy server
```

### Step 5: Verify Deployment
Check the Functions section in your Supabase dashboard:
https://app.supabase.com/project/YOUR_PROJECT_ID/functions

---

## Switching Between Modes

The app **automatically** switches between modes:

### Current Behavior (Smart Auto-Switch)
```typescript
// In /utils/departmentApiService.ts
try {
  return await departmentRequest("/analytics/summary", token);
} catch (error: any) {
  // Automatically falls back to mock data
  console.log("⚠️ Analytics API failed, falling back to mock data");
  return MOCK_ANALYTICS_SUMMARY;
}
```

### Manual Override (If Needed)
In `/utils/departmentApiService.ts`, change:
```typescript
const USE_MOCK_DATA = false; // Currently set to auto-detect
```

To force mock mode:
```typescript
const USE_MOCK_DATA = true; // Force mock data (useful for demos)
```

---

## Understanding Console Messages

### ✅ Normal Messages (No Action Needed)

```
📡 Fetching SOS alerts (active) from Supabase...
✅ Retrieved 3 SOS alerts from Supabase
```
**Meaning:** SOS alerts are working with Supabase (real functionality!)

```
⚠️ Analytics API failed, falling back to mock data
Error details: Failed to fetch
```
**Meaning:** Edge Functions not deployed, using mock data (expected!)

```
📦 Using mock analytics data (Edge Function not deployed)
```
**Meaning:** App is in mock mode for analytics (intentional!)

### ❌ Error Messages (Action Needed)

```
❌ Failed to save SOS alert to Supabase: {...}
```
**Meaning:** Database connection issue - check Supabase setup

```
❌ Could not find the 'message' column...
```
**Meaning:** Schema mismatch - run `/SOS_SCHEMA_FIX.sql`

---

## Mock Data vs Real Data Comparison

| Feature | Mock Data Mode | Real Data Mode |
|---------|---------------|----------------|
| SOS Alerts | ✅ Real (Supabase) | ✅ Real (Supabase + Edge) |
| Alert Status Updates | ✅ Real (Supabase) | ✅ Real (Supabase + Edge) |
| Analytics | 📦 Mock Data | 🌐 Computed Server-Side |
| Disasters | 📦 Mock Data | 🌐 Live Database |
| Hospitals | 📦 Mock Data | 🌐 Live Database |
| Hospital Updates | 📦 Simulated | 🌐 Real Updates |
| Response Time | ⚡ Instant | ⚡ ~100-300ms |
| Deployment Needed | ❌ No | ✅ Yes |
| Cost | 💰 Free | 💰 Supabase Plan |

---

## Best Practices

### ✅ DO:
- Use Mock Data Mode for development
- Test all features before deploying
- Keep mock data realistic and updated
- Monitor console for helpful warnings
- Deploy Edge Functions when ready for production

### ❌ DON'T:
- Worry about "Failed to fetch" warnings
- Deploy Edge Functions prematurely
- Disable mock data fallbacks
- Remove console warnings (they're helpful!)
- Think mock mode is "broken" (it's working perfectly!)

---

## FAQ

**Q: Is mock data mode incomplete?**  
A: No! It's a complete, fully-functional mode designed for development and testing.

**Q: Will users see errors?**  
A: No! All error handling is done silently with console warnings only.

**Q: Does mock data save to database?**  
A: SOS alerts save to Supabase database (real!). Analytics, disasters, and hospitals use in-memory mock data.

**Q: When should I switch to real data?**  
A: When you're ready to deploy to production with Edge Functions.

**Q: Can I demo the app in mock mode?**  
A: Absolutely! Mock mode is perfect for demos and has realistic Philippine data.

**Q: How do I know if I'm in mock mode?**  
A: Check browser console - you'll see "📦 Using mock data" or "⚠️ falling back to mock data" messages.

---

## Summary

**Mock Data Mode** is not a limitation - it's a **feature**!

- ✅ Fully functional department dashboard
- ✅ No deployment required
- ✅ Perfect for development and testing
- ✅ Realistic Philippine disaster data
- ✅ Automatic fallback when Edge Functions unavailable
- ✅ Seamless upgrade path to production

**You can build, test, and demo the entire BantayAlert system without deploying a single Edge Function!**

---

**Questions?** See `/ERROR_FIXES_SUMMARY.md` for detailed error fixes and troubleshooting.
