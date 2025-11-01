# 🚀 Quick Reference - Real-Time BantayAlert

## 5-Minute Setup

```bash
1. Copy /SUPABASE_REALTIME_SETUP.sql
2. Paste in Supabase Dashboard → SQL Editor → Run
3. Go to Database → Replication → Enable realtime for all tables
4. Done! 🎉
```

## Test Credentials

### Department Logins
```
Manila LGU:      manila.lgu@bantayalert.ph / Manila2025!
Quezon City LGU: quezon.lgu@bantayalert.ph / Quezon2025!
Fire Bureau:     bfp.ncr@bantayalert.ph / FireProtection2025!
PGH Hospital:    pgh.healthcare@bantayalert.ph / Healthcare2025!
NDRRMC:          ndrrmc@bantayalert.ph / DisasterMgmt2025!
```

## Import Statements

### For Citizen Components
```typescript
import { createSOSAlert, getActiveWeatherWarnings, subscribeToWeatherWarnings } from "../utils/realtimeDepartmentService";
```

### For Department Components
```typescript
import { 
  getSOSAlerts, 
  updateSOSAlert,
  subscribeToSOSAlerts,
  getActiveDisasters,
  createDisasterEvent,
  getHospitals,
  updateHospitalCapacity,
  getAnalyticsSummary,
  unsubscribeChannel
} from "../../utils/realtimeDepartmentService";
```

## Common Patterns

### Create SOS Alert (Citizen)
```typescript
await createSOSAlert({
  userEmail: user.email,
  userName: user.name,
  location: { lat: 14.5995, lng: 120.9842, address: "Manila" },
  details: "Emergency!",
  contactNumber: "+63 912 345 6789"
});
```

### Subscribe to Updates (Department)
```typescript
const [channel, setChannel] = useState(null);

useEffect(() => {
  const sosChannel = subscribeToSOSAlerts((payload) => {
    console.log("New alert!", payload);
    loadAlerts(); // Refresh data
  });
  setChannel(sosChannel);
  
  return () => {
    if (channel) unsubscribeChannel(channel);
  };
}, []);
```

### Update Alert Status (Department)
```typescript
await updateSOSAlert(alertId, {
  status: "responding",
  assigned_department_id: departmentId
});
```

### Send Weather Warning (Department)
```typescript
await createWeatherWarning({
  warningType: "typhoon",
  title: "Typhoon Warning",
  description: "Stay indoors!",
  severity: "critical",
  affectedAreas: ["Manila", "Quezon City"]
});
```

### Update Hospital Capacity (Healthcare)
```typescript
await updateHospitalCapacity(hospitalId, {
  availableBeds: 50,
  emergencyCapacity: 20,
  icuCapacity: 10,
  status: "operational"
});
```

## Database Tables

| Table | Purpose | Realtime |
|-------|---------|----------|
| `sos_alerts` | SOS alerts from citizens | ✅ |
| `disaster_events` | Active disasters | ✅ |
| `hospitals` | Hospital capacity | ✅ |
| `weather_warnings` | Dept → Citizen warnings | ✅ |
| `department_users` | Department accounts | ❌ |
| `analytics_summary` | Dashboard stats | ✅ |

## Status Values

### SOS Alert Status
- `active` - Just created, waiting for response
- `responding` - Department is handling it
- `resolved` - Issue resolved
- `cancelled` - False alarm

### Alert Priority
- `critical` - Life threatening
- `high` - Urgent
- `medium` - Important
- `low` - Non-urgent

### Hospital Status
- `operational` - Normal operations
- `limited` - Limited capacity
- `full` - No beds available
- `offline` - Not accepting patients

### Disaster Severity
- `minor` - Small impact
- `moderate` - Significant impact
- `major` - Large impact
- `catastrophic` - Massive impact

## API Functions Reference

### SOS Alerts
```typescript
createSOSAlert(data)           // Citizen creates alert
getSOSAlerts(status)           // Get alerts (active/all)
updateSOSAlert(id, updates)    // Update alert
subscribeToSOSAlerts(callback) // Real-time updates
```

### Disasters
```typescript
getActiveDisasters()            // Get active disasters
createDisasterEvent(data)       // Create disaster
updateDisasterEvent(id, data)   // Update disaster
subscribeToDisasters(callback)  // Real-time updates
```

### Hospitals
```typescript
getHospitals()                     // Get all hospitals
updateHospitalCapacity(id, data)   // Update capacity
subscribeToHospitals(callback)     // Real-time updates
```

### Weather Warnings
```typescript
createWeatherWarning(data)              // Create warning
getActiveWeatherWarnings()              // Get active warnings
subscribeToWeatherWarnings(callback)    // Real-time updates
```

### Analytics
```typescript
getAnalyticsSummary()          // Get stats
refreshAnalytics()             // Manual refresh
subscribeToAnalytics(callback) // Real-time updates
```

### Authentication
```typescript
authenticateDepartment(email, pass) // Login
getCurrentDepartmentUser()          // Get current user
isDepartmentLoggedIn()              // Check if logged in
logoutDepartment()                  // Logout
```

## Troubleshooting Commands

### Check if tables exist
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

### Check realtime publications
```sql
SELECT * FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';
```

### View recent SOS alerts
```sql
SELECT * FROM sos_alerts ORDER BY created_at DESC LIMIT 10;
```

### Check analytics
```sql
SELECT * FROM analytics_summary;
```

### Manual analytics refresh
```sql
SELECT refresh_analytics_summary();
```

## File Locations

| File | Purpose |
|------|---------|
| `/SUPABASE_REALTIME_SETUP.sql` | Database schema |
| `/utils/realtimeDepartmentService.ts` | API service |
| `/utils/setupDepartmentPasswords.ts` | Authentication |
| `/IMPLEMENTATION_CHECKLIST.md` | Setup steps |
| `/REAL_TIME_SETUP_GUIDE.md` | Full guide |

## Testing URLs

### Supabase Dashboard
```
https://app.supabase.com
→ Your Project
→ SQL Editor (run SQL)
→ Database > Replication (enable realtime)
→ Table Editor (view data)
```

### Test Flow
```
1. Citizen App → Click SOS
2. Department Dashboard → See alert appear
3. Update alert status → See update in citizen app
4. Create weather warning → See in citizen app
```

## Performance Tips

1. **Unsubscribe when done** - Always cleanup channels
2. **Batch updates** - Update multiple fields at once
3. **Use indexes** - Already created in SQL
4. **Limit queries** - Use status filters
5. **Cache data** - Store in component state

## Security Checklist

- ✅ RLS enabled on all tables
- ✅ Department authentication required
- ⚠️ Passwords need bcrypt (production)
- ⚠️ Add rate limiting (production)
- ⚠️ Add 2FA (production)

## Support

- Full Guide: `/REAL_TIME_SETUP_GUIDE.md`
- Code Updates: `/IMPLEMENTATION_CHECKLIST.md`
- Setup: `/SWITCH_TO_REAL_TIME.md`
- Passwords: `/utils/setupDepartmentPasswords.ts`

---

**Ready to build? Start with `/SWITCH_TO_REAL_TIME.md`** 🚀
