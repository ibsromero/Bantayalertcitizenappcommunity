# 📋 Implementation Checklist - Switch from Mock to Real Data

## Quick Overview

Follow these steps to switch from mock data to fully functional real-time system.

## ✅ Step 1: Run Database Setup (5 minutes)

1. Open `/SUPABASE_REALTIME_SETUP.sql`
2. Copy everything
3. Go to Supabase Dashboard → SQL Editor
4. Paste and click **Run**
5. Wait for "Success" message

## ✅ Step 2: Enable Realtime (2 minutes)

1. Go to Supabase Dashboard → Database → Replication
2. Enable these tables (toggle switch to ON):
   - `sos_alerts`
   - `disaster_events`
   - `weather_warnings`
   - `hospitals`
   - `analytics_summary`

## ✅ Step 3: Update Files (listed below)

### File 1: `/components/SOSButton.tsx`

**Find this import:**
```typescript
import { createSOSAlert } from "../utils/departmentApiService";
```

**Replace with:**
```typescript
import { createSOSAlert } from "../utils/realtimeDepartmentService";
```

**The rest of the code stays the same!** The new service has the same function signature.

---

### File 2: `/components/department/SOSAlertTracker.tsx`

**Add these imports at the top:**
```typescript
import { 
  getSOSAlerts, 
  updateSOSAlert,
  subscribeToSOSAlerts,
  unsubscribeChannel 
} from "../../utils/realtimeDepartmentService";
import type { RealtimeChannel } from "@supabase/supabase-js";
```

**Inside the component, add state for channel:**
```typescript
const [channel, setChannel] = useState<RealtimeChannel | null>(null);
```

**Update the useEffect to load data:**
```typescript
useEffect(() => {
  loadAlerts();
  setupRealtime();
  
  return () => {
    if (channel) {
      unsubscribeChannel(channel);
    }
  };
}, []);

async function loadAlerts() {
  try {
    const { alerts } = await getSOSAlerts("all");
    setAlerts(alerts);
  } catch (error) {
    console.error("Failed to load alerts:", error);
  }
}

function setupRealtime() {
  const sosChannel = subscribeToSOSAlerts((payload) => {
    console.log("Real-time SOS update:", payload);
    // Reload alerts when changes occur
    loadAlerts();
  });
  setChannel(sosChannel);
}
```

**Update the handleUpdateAlert function:**
```typescript
async function handleUpdateAlert(alertId: string, updates: any) {
  try {
    await updateSOSAlert(alertId, updates);
    // Data will refresh automatically via realtime subscription
  } catch (error) {
    console.error("Failed to update alert:", error);
  }
}
```

---

### File 3: `/components/department/DisasterMonitoring.tsx`

**Add these imports:**
```typescript
import { 
  getActiveDisasters,
  createDisasterEvent,
  updateDisasterEvent,
  subscribeToDisasters,
  unsubscribeChannel 
} from "../../utils/realtimeDepartmentService";
import type { RealtimeChannel } from "@supabase/supabase-js";
```

**Add realtime subscription similar to SOSAlertTracker:**
```typescript
const [channel, setChannel] = useState<RealtimeChannel | null>(null);

useEffect(() => {
  loadDisasters();
  setupRealtime();
  
  return () => {
    if (channel) {
      unsubscribeChannel(channel);
    }
  };
}, []);

async function loadDisasters() {
  try {
    const { disasters } = await getActiveDisasters();
    setDisasters(disasters);
  } catch (error) {
    console.error("Failed to load disasters:", error);
  }
}

function setupRealtime() {
  const disasterChannel = subscribeToDisasters((payload) => {
    console.log("Real-time disaster update:", payload);
    loadDisasters();
  });
  setChannel(disasterChannel);
}
```

---

### File 4: `/components/department/HealthcareIntegration.tsx`

**Add these imports:**
```typescript
import { 
  getHospitals,
  updateHospitalCapacity,
  subscribeToHospitals,
  unsubscribeChannel 
} from "../../utils/realtimeDepartmentService";
import type { RealtimeChannel } from "@supabase/supabase-js";
```

**Add realtime subscription:**
```typescript
const [channel, setChannel] = useState<RealtimeChannel | null>(null);

useEffect(() => {
  loadHospitals();
  setupRealtime();
  
  return () => {
    if (channel) {
      unsubscribeChannel(channel);
    }
  };
}, []);

async function loadHospitals() {
  try {
    const { hospitals } = await getHospitals();
    setHospitals(hospitals);
  } catch (error) {
    console.error("Failed to load hospitals:", error);
  }
}

function setupRealtime() {
  const hospitalChannel = subscribeToHospitals((payload) => {
    console.log("Real-time hospital update:", payload);
    loadHospitals();
  });
  setChannel(hospitalChannel);
}

async function handleUpdateHospital(hospitalId: string, updates: any) {
  try {
    await updateHospitalCapacity(hospitalId, updates);
    // Will refresh via realtime
  } catch (error) {
    console.error("Failed to update hospital:", error);
  }
}
```

---

### File 5: `/components/department/DataAnalytics.tsx`

**Add these imports:**
```typescript
import { 
  getAnalyticsSummary,
  subscribeToAnalytics,
  unsubscribeChannel 
} from "../../utils/realtimeDepartmentService";
import type { RealtimeChannel } from "@supabase/supabase-js";
```

**Add realtime subscription:**
```typescript
const [channel, setChannel] = useState<RealtimeChannel | null>(null);

useEffect(() => {
  loadAnalytics();
  setupRealtime();
  
  return () => {
    if (channel) {
      unsubscribeChannel(channel);
    }
  };
}, []);

async function loadAnalytics() {
  try {
    const analytics = await getAnalyticsSummary();
    setAnalytics(analytics);
  } catch (error) {
    console.error("Failed to load analytics:", error);
  }
}

function setupRealtime() {
  const analyticsChannel = subscribeToAnalytics((payload) => {
    console.log("Real-time analytics update:", payload);
    loadAnalytics();
  });
  setChannel(analyticsChannel);
}
```

---

### File 6: `/components/DepartmentDashboard.tsx`

**Remove or hide MockDataBanner:**
```typescript
// Remove this line:
import { MockDataBanner } from "./MockDataBanner";

// Remove this from JSX:
// <MockDataBanner />
```

**Update authentication to use real department auth:**
```typescript
import { authenticateDepartment } from "../utils/realtimeDepartmentService";

// In login handler:
async function handleLogin(email: string, password: string) {
  const { user, token, error } = await authenticateDepartment(email, password);
  
  if (error) {
    alert("Login failed: " + error);
    return;
  }
  
  localStorage.setItem("department_token", token);
  localStorage.setItem("department_user", JSON.stringify(user));
  setDepartmentUser(user);
}
```

---

### File 7: `/components/WeatherAlerts.tsx` (Citizen Side)

**Add these imports to receive department warnings:**
```typescript
import { 
  getActiveWeatherWarnings,
  subscribeToWeatherWarnings,
  unsubscribeChannel 
} from "../utils/realtimeDepartmentService";
import type { RealtimeChannel } from "@supabase/supabase-js";
```

**Add realtime subscription:**
```typescript
const [channel, setChannel] = useState<RealtimeChannel | null>(null);

useEffect(() => {
  loadWarnings();
  setupRealtime();
  
  return () => {
    if (channel) {
      unsubscribeChannel(channel);
    }
  };
}, []);

async function loadWarnings() {
  try {
    const { warnings } = await getActiveWeatherWarnings();
    setWarnings(warnings);
  } catch (error) {
    console.error("Failed to load warnings:", error);
  }
}

function setupRealtime() {
  const warningChannel = subscribeToWeatherWarnings((payload) => {
    console.log("Real-time weather warning:", payload);
    loadWarnings();
    // Show notification to user
    if (payload.eventType === 'INSERT') {
      showNotification(payload.new.title, payload.new.description);
    }
  });
  setChannel(warningChannel);
}
```

---

### File 8: Create Weather Warning Component for Departments

Create new file `/components/department/WeatherWarningCreator.tsx`:

```typescript
import React, { useState } from "react";
import { createWeatherWarning } from "../../utils/realtimeDepartmentService";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

export function WeatherWarningCreator() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<"advisory" | "warning" | "critical">("warning");
  const [areas, setAreas] = useState<string[]>([]);

  async function handleSubmit() {
    try {
      const departmentUser = JSON.parse(localStorage.getItem("department_user") || "{}");
      
      await createWeatherWarning({
        warningType: "severe_weather",
        title,
        description,
        severity,
        affectedAreas: areas,
        issuedByDepartmentId: departmentUser.id,
        issuedByDepartmentName: departmentUser.department_name,
      });
      
      alert("Weather warning sent to citizens!");
      setTitle("");
      setDescription("");
    } catch (error) {
      console.error("Failed to create warning:", error);
      alert("Failed to send warning");
    }
  }

  return (
    <div className="p-4 border rounded">
      <h3>Send Weather Warning to Citizens</h3>
      
      <Input 
        placeholder="Warning Title" 
        value={title} 
        onChange={(e) => setTitle(e.target.value)}
      />
      
      <Textarea 
        placeholder="Warning Description" 
        value={description} 
        onChange={(e) => setDescription(e.target.value)}
      />
      
      <select value={severity} onChange={(e) => setSeverity(e.target.value as any)}>
        <option value="advisory">Advisory</option>
        <option value="warning">Warning</option>
        <option value="critical">Critical</option>
      </select>
      
      <Button onClick={handleSubmit}>
        Send Warning to Citizens
      </Button>
    </div>
  );
}
```

---

## ✅ Step 4: Test Everything

### Test 1: SOS Alert Flow
1. Open citizen app
2. Click SOS button
3. Fill details and send
4. Open department dashboard
5. Should see alert appear!

### Test 2: Department Updates
1. In department dashboard, update SOS alert status
2. Should see update reflect immediately

### Test 3: Weather Warnings
1. Create weather warning in department dashboard
2. Should see it appear in citizen app immediately

### Test 4: Hospital Updates
1. Update hospital capacity in healthcare dashboard
2. Should see changes in hospital locator

## ✅ Step 5: Remove Mock Data Files (Optional)

Once everything is working, you can remove:
- `/utils/mockDepartmentData.ts` (no longer needed)
- `/utils/departmentApiService.ts` (replaced by realtimeDepartmentService)
- `/components/MockDataBanner.tsx` (no longer needed)

## 🎉 Done!

You now have a fully functional real-time disaster preparedness system with:
- ✅ Real-time SOS alerts
- ✅ Real-time weather warnings
- ✅ Live hospital capacity
- ✅ Live disaster monitoring
- ✅ Auto-updating analytics
- ✅ Department authentication
- ✅ Bidirectional communication

## 📞 Support

If you run into issues:
1. Check browser console for errors
2. Check Supabase Dashboard → Database → Table Editor to see if data is being created
3. Verify Realtime is enabled in Database → Replication
4. Check the `/REAL_TIME_SETUP_GUIDE.md` for troubleshooting

---

**Estimated time to implement: 30-60 minutes** ⏱️
