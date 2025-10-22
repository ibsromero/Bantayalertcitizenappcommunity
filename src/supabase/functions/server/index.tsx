import { Hono } from "npm:hono@4";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";

const app = new Hono();

// Middleware
app.use("*", cors());
app.use("*", logger(console.log));

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// Health check
app.get("/make-server-dd0f68d8/health", (c) => {
  return c.json({ status: "ok", service: "BantayAlert API" });
});

// Initialize sample data for demonstration
app.post("/make-server-dd0f68d8/init-sample-data", async (c) => {
  try {
    console.log("Initializing sample department data...");
    
    // Initialize sample hospitals
    const sampleHospitals = [
      {
        id: "hosp_001",
        name: "Philippine General Hospital",
        location: "Manila",
        totalBeds: 1500,
        availableBeds: 320,
        emergencyCapacity: 85,
        icuCapacity: 45,
        status: "operational",
        contact: "+63 2 8554 8400",
        updated_at: new Date().toISOString()
      },
      {
        id: "hosp_002",
        name: "Makati Medical Center",
        location: "Makati City",
        totalBeds: 600,
        availableBeds: 142,
        emergencyCapacity: 95,
        icuCapacity: 28,
        status: "operational",
        contact: "+63 2 8888 8999",
        updated_at: new Date().toISOString()
      },
      {
        id: "hosp_003",
        name: "Veterans Memorial Medical Center",
        location: "Quezon City",
        totalBeds: 1000,
        availableBeds: 218,
        emergencyCapacity: 75,
        icuCapacity: 32,
        status: "operational",
        contact: "+63 2 8927 0001",
        updated_at: new Date().toISOString()
      },
      {
        id: "hosp_004",
        name: "Pasig City General Hospital",
        location: "Pasig City",
        totalBeds: 300,
        availableBeds: 87,
        emergencyCapacity: 60,
        icuCapacity: 15,
        status: "operational",
        contact: "+63 2 8643 1411",
        updated_at: new Date().toISOString()
      },
      {
        id: "hosp_005",
        name: "Manila Doctors Hospital",
        location: "Manila",
        totalBeds: 400,
        availableBeds: 93,
        emergencyCapacity: 70,
        icuCapacity: 20,
        status: "operational",
        contact: "+63 2 8558 0888",
        updated_at: new Date().toISOString()
      }
    ];

    const { error: hospitalsError } = await supabase
      .from("kv_store_dd0f68d8")
      .upsert({
        key: "hospitals_capacity",
        value: sampleHospitals,
        updated_at: new Date().toISOString()
      });

    if (hospitalsError) {
      console.error("Error saving hospitals data:", hospitalsError);
      throw hospitalsError;
    }
    
    console.log("✓ Hospitals data saved");

    // Initialize sample active disasters
    const sampleDisasters = [
      {
        id: "disaster_001",
        type: "flood",
        name: "Marikina River Flooding",
        severity: "high",
        location: "Marikina City",
        affectedAreas: ["Brgy. Tumana", "Brgy. Santo Niño", "Brgy. San Roque"],
        affectedPopulation: 1250,
        evacuees: 450,
        status: "active",
        description: "Heavy rainfall causing river overflow. Water level at critical stage.",
        created_at: new Date(Date.now() - 7200000).toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: "disaster_002",
        type: "typhoon",
        name: "Typhoon Signal #2 - NCR",
        severity: "medium",
        location: "Metro Manila",
        affectedAreas: ["Quezon City", "Manila", "Pasay"],
        affectedPopulation: 2500,
        evacuees: 680,
        status: "active",
        description: "Tropical depression affecting NCR with strong winds and heavy rain.",
        created_at: new Date(Date.now() - 14400000).toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    const { error: disastersError } = await supabase
      .from("kv_store_dd0f68d8")
      .upsert({
        key: "disasters_active",
        value: sampleDisasters,
        updated_at: new Date().toISOString()
      });

    if (disastersError) {
      console.error("Error saving disasters data:", disastersError);
      throw disastersError;
    }
    
    console.log("✓ Disasters data saved");
    
    // Initialize empty SOS alerts array
    const { error: sosError } = await supabase
      .from("kv_store_dd0f68d8")
      .upsert({
        key: "sos_alerts_all",
        value: [],
        updated_at: new Date().toISOString()
      });

    if (sosError) {
      console.error("Error initializing SOS alerts:", sosError);
      throw sosError;
    }
    
    console.log("✓ SOS alerts initialized");
    console.log("✓ All sample data initialized successfully");

    return c.json({ 
      success: true, 
      message: "Sample data initialized",
      data: {
        hospitals: sampleHospitals.length,
        disasters: sampleDisasters.length
      }
    });
  } catch (error) {
    console.error("Sample data initialization error:", error);
    return c.json({ error: "Failed to initialize sample data" }, 500);
  }
});

// Sign up endpoint
app.post("/make-server-dd0f68d8/auth/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();

    if (!email || !password || !name) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    // Create user
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm since we don't have email server configured
      user_metadata: { name },
    });

    if (error) {
      console.error("Signup error:", error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ 
      success: true, 
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata.name
      }
    });
  } catch (error) {
    console.error("Signup error:", error);
    return c.json({ error: "Signup failed" }, 500);
  }
});

// Save user data (contacts, checklists, etc.)
app.post("/make-server-dd0f68d8/user/data", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { dataType, data } = await c.req.json();

    // Save to key-value store
    const key = `user_${user.id}_${dataType}`;
    const { error } = await supabase
      .from("kv_store_dd0f68d8")
      .upsert({ 
        key, 
        value: data,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error("Data save error:", error);
      return c.json({ error: "Failed to save data" }, 500);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error("Data save error:", error);
    return c.json({ error: "Failed to save data" }, 500);
  }
});

// Get user data
app.get("/make-server-dd0f68d8/user/data/:dataType", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const dataType = c.req.param("dataType");
    const key = `user_${user.id}_${dataType}`;

    const { data, error } = await supabase
      .from("kv_store_dd0f68d8")
      .select("value")
      .eq("key", key)
      .single();

    if (error && error.code !== "PGRST116") { // PGRST116 is "not found"
      console.error("Data fetch error:", error);
      return c.json({ error: "Failed to fetch data" }, 500);
    }

    return c.json({ data: data?.value || null });
  } catch (error) {
    console.error("Data fetch error:", error);
    return c.json({ error: "Failed to fetch data" }, 500);
  }
});

// Weather API endpoint (mock for now, can integrate real API)
app.get("/make-server-dd0f68d8/weather/:location", async (c) => {
  try {
    const location = c.req.param("location");
    
    // Mock weather data for NCR
    // In production, integrate with PAGASA API or OpenWeatherMap
    const weatherData = {
      location,
      current: {
        temp: 28 + Math.floor(Math.random() * 5),
        condition: "Partly Cloudy",
        humidity: 70 + Math.floor(Math.random() * 15),
        windSpeed: 10 + Math.floor(Math.random() * 10),
        pressure: 1010,
      },
      alerts: [
        {
          type: "Heavy Rainfall Warning",
          severity: "medium",
          description: "Moderate to heavy rainfall expected due to Southwest Monsoon",
        },
      ],
    };

    return c.json(weatherData);
  } catch (error) {
    console.error("Weather fetch error:", error);
    return c.json({ error: "Failed to fetch weather" }, 500);
  }
});

// Log activity endpoint
app.post("/make-server-dd0f68d8/activity/log", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    
    // Activity logging works both with and without auth
    const body = await c.req.json();
    const { type, description } = body;

    if (!type || !description) {
      return c.json({ error: "Missing type or description" }, 400);
    }

    // If user is authenticated, save to their profile
    if (accessToken) {
      const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
      
      if (!authError && user) {
        const key = `user_${user.id}_activities`;
        
        // Get existing activities
        const { data: existingData } = await supabase
          .from("kv_store_dd0f68d8")
          .select("value")
          .eq("key", key)
          .single();

        const activities = existingData?.value || [];
        const newActivity = {
          id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type,
          description,
          timestamp: Date.now(),
        };

        const updatedActivities = [newActivity, ...activities].slice(0, 20);

        await supabase
          .from("kv_store_dd0f68d8")
          .upsert({
            key,
            value: updatedActivities,
            updated_at: new Date().toISOString(),
          });
      }
    }

    return c.json({ success: true });
  } catch (error) {
    console.error("Activity log error:", error);
    return c.json({ error: "Failed to log activity" }, 500);
  }
});

// ============ DEPARTMENT AUTHENTICATION ============

// Department credentials validation
const DEPARTMENT_CREDENTIALS = {
  "lgu@bantayalert.ph": { 
    password: "LGU2025!Manila", 
    name: "LGU Administrator",
    role: "lgu",
    department: "Local Government Unit"
  },
  "responder@bantayalert.ph": { 
    password: "RESP2025!911", 
    name: "Emergency Responder",
    role: "emergency_responder",
    department: "Emergency Response Team"
  },
  "healthcare@bantayalert.ph": { 
    password: "HEALTH2025!Care", 
    name: "Healthcare Provider",
    role: "healthcare",
    department: "Healthcare Services"
  },
  "ndrrmc@bantayalert.ph": { 
    password: "NDRRMC2025!PH", 
    name: "Disaster Management",
    role: "disaster_management",
    department: "NDRRMC"
  }
};

// Department sign-in endpoint
app.post("/make-server-dd0f68d8/department/signin", async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: "Missing email or password" }, 400);
    }

    const dept = DEPARTMENT_CREDENTIALS[email as keyof typeof DEPARTMENT_CREDENTIALS];
    
    if (!dept || dept.password !== password) {
      return c.json({ error: "Invalid department credentials" }, 401);
    }

    // Create a session token for the department
    const sessionToken = `dept_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Store session
    await supabase
      .from("kv_store_dd0f68d8")
      .upsert({
        key: `dept_session_${sessionToken}`,
        value: {
          email,
          name: dept.name,
          role: dept.role,
          department: dept.department,
          created_at: new Date().toISOString()
        },
        updated_at: new Date().toISOString()
      });

    return c.json({
      success: true,
      session: {
        token: sessionToken,
        email,
        name: dept.name,
        role: dept.role,
        department: dept.department
      }
    });
  } catch (error) {
    console.error("Department signin error:", error);
    return c.json({ error: "Department sign-in failed" }, 500);
  }
});

// Verify department session
const verifyDepartmentSession = async (token: string) => {
  try {
    const { data } = await supabase
      .from("kv_store_dd0f68d8")
      .select("value")
      .eq("key", `dept_session_${token}`)
      .single();
    
    return data?.value || null;
  } catch {
    return null;
  }
};

// ============ SOS ALERTS MANAGEMENT ============

// Create SOS alert
app.post("/make-server-dd0f68d8/sos/create", async (c) => {
  try {
    const { userEmail, userName, location, details, contactNumber } = await c.req.json();

    if (!userEmail || !userName) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    const alertId = `sos_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const sosAlert = {
      id: alertId,
      userEmail,
      userName,
      location: location || { lat: null, lng: null, address: "Location unavailable" },
      details: details || "Emergency assistance needed",
      contactNumber: contactNumber || "Not provided",
      status: "active",
      priority: "high",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      responded_by: null,
      resolution: null
    };

    // Get existing alerts
    const { data: existingData } = await supabase
      .from("kv_store_dd0f68d8")
      .select("value")
      .eq("key", "sos_alerts_active")
      .single();

    const alerts = existingData?.value || [];
    const updatedAlerts = [sosAlert, ...alerts];

    // Save updated alerts
    await supabase
      .from("kv_store_dd0f68d8")
      .upsert({
        key: "sos_alerts_active",
        value: updatedAlerts,
        updated_at: new Date().toISOString()
      });

    // Also save to all alerts history
    const { data: historyData } = await supabase
      .from("kv_store_dd0f68d8")
      .select("value")
      .eq("key", "sos_alerts_all")
      .single();

    const allAlerts = historyData?.value || [];
    await supabase
      .from("kv_store_dd0f68d8")
      .upsert({
        key: "sos_alerts_all",
        value: [sosAlert, ...allAlerts],
        updated_at: new Date().toISOString()
      });

    return c.json({ success: true, alertId });
  } catch (error) {
    console.error("SOS alert creation error:", error);
    return c.json({ error: "Failed to create SOS alert" }, 500);
  }
});

// Get all SOS alerts (Department only)
app.get("/make-server-dd0f68d8/sos/alerts", async (c) => {
  try {
    const token = c.req.header("Authorization")?.split(" ")[1];
    
    console.log("SOS alerts request - token:", token?.substring(0, 15) + '...');
    
    // Verify department session
    if (!token || !token.startsWith("dept_")) {
      console.log("SOS alerts request rejected - invalid token format");
      return c.json({ error: "Unauthorized - Department access only" }, 401);
    }

    const session = await verifyDepartmentSession(token);
    if (!session) {
      console.log("SOS alerts request rejected - invalid session");
      return c.json({ error: "Invalid session" }, 401);
    }
    
    console.log("SOS alerts request authorized for:", session.name);

    const status = c.req.query("status") || "active";
    const key = status === "all" ? "sos_alerts_all" : "sos_alerts_active";

    const { data } = await supabase
      .from("kv_store_dd0f68d8")
      .select("value")
      .eq("key", key)
      .single();

    const alerts = data?.value || [];
    
    // Filter by status if needed
    const filteredAlerts = status === "active" 
      ? alerts.filter((alert: any) => alert.status === "active")
      : alerts;

    return c.json({ alerts: filteredAlerts });
  } catch (error) {
    console.error("SOS alerts fetch error:", error);
    return c.json({ error: "Failed to fetch SOS alerts" }, 500);
  }
});

// Update SOS alert status
app.put("/make-server-dd0f68d8/sos/alert/:id", async (c) => {
  try {
    const token = c.req.header("Authorization")?.split(" ")[1];
    
    // Verify department session
    if (!token || !token.startsWith("dept_")) {
      return c.json({ error: "Unauthorized - Department access only" }, 401);
    }

    const session = await verifyDepartmentSession(token);
    if (!session) {
      return c.json({ error: "Invalid session" }, 401);
    }

    const alertId = c.req.param("id");
    const { status, resolution, priority } = await c.req.json();

    // Update in active alerts
    const { data: activeData } = await supabase
      .from("kv_store_dd0f68d8")
      .select("value")
      .eq("key", "sos_alerts_active")
      .single();

    const activeAlerts = activeData?.value || [];
    const updatedActiveAlerts = activeAlerts.map((alert: any) => {
      if (alert.id === alertId) {
        return {
          ...alert,
          status: status || alert.status,
          priority: priority || alert.priority,
          resolution: resolution || alert.resolution,
          responded_by: session.name,
          updated_at: new Date().toISOString()
        };
      }
      return alert;
    });

    await supabase
      .from("kv_store_dd0f68d8")
      .upsert({
        key: "sos_alerts_active",
        value: updatedActiveAlerts,
        updated_at: new Date().toISOString()
      });

    // Update in all alerts history
    const { data: allData } = await supabase
      .from("kv_store_dd0f68d8")
      .select("value")
      .eq("key", "sos_alerts_all")
      .single();

    const allAlerts = allData?.value || [];
    const updatedAllAlerts = allAlerts.map((alert: any) => {
      if (alert.id === alertId) {
        return {
          ...alert,
          status: status || alert.status,
          priority: priority || alert.priority,
          resolution: resolution || alert.resolution,
          responded_by: session.name,
          updated_at: new Date().toISOString()
        };
      }
      return alert;
    });

    await supabase
      .from("kv_store_dd0f68d8")
      .upsert({
        key: "sos_alerts_all",
        value: updatedAllAlerts,
        updated_at: new Date().toISOString()
      });

    return c.json({ success: true });
  } catch (error) {
    console.error("SOS alert update error:", error);
    return c.json({ error: "Failed to update SOS alert" }, 500);
  }
});

// ============ DISASTER MONITORING ============

// Get active disasters
app.get("/make-server-dd0f68d8/disasters/active", async (c) => {
  try {
    const token = c.req.header("Authorization")?.split(" ")[1];
    
    if (!token || !token.startsWith("dept_")) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { data } = await supabase
      .from("kv_store_dd0f68d8")
      .select("value")
      .eq("key", "disasters_active")
      .single();

    return c.json({ disasters: data?.value || [] });
  } catch (error) {
    console.error("Disasters fetch error:", error);
    return c.json({ error: "Failed to fetch disasters" }, 500);
  }
});

// Create/update disaster event
app.post("/make-server-dd0f68d8/disasters/event", async (c) => {
  try {
    const token = c.req.header("Authorization")?.split(" ")[1];
    
    if (!token || !token.startsWith("dept_")) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const session = await verifyDepartmentSession(token);
    if (!session) {
      return c.json({ error: "Invalid session" }, 401);
    }

    const eventData = await c.req.json();
    const eventId = eventData.id || `disaster_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const disasterEvent = {
      id: eventId,
      ...eventData,
      created_by: session.name,
      created_at: eventData.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: existingData } = await supabase
      .from("kv_store_dd0f68d8")
      .select("value")
      .eq("key", "disasters_active")
      .single();

    const disasters = existingData?.value || [];
    const existingIndex = disasters.findIndex((d: any) => d.id === eventId);
    
    let updatedDisasters;
    if (existingIndex >= 0) {
      updatedDisasters = [...disasters];
      updatedDisasters[existingIndex] = disasterEvent;
    } else {
      updatedDisasters = [disasterEvent, ...disasters];
    }

    await supabase
      .from("kv_store_dd0f68d8")
      .upsert({
        key: "disasters_active",
        value: updatedDisasters,
        updated_at: new Date().toISOString()
      });

    return c.json({ success: true, eventId });
  } catch (error) {
    console.error("Disaster event creation error:", error);
    return c.json({ error: "Failed to create disaster event" }, 500);
  }
});

// ============ HEALTHCARE INTEGRATION ============

// Get hospital capacity data
app.get("/make-server-dd0f68d8/healthcare/hospitals", async (c) => {
  try {
    const { data } = await supabase
      .from("kv_store_dd0f68d8")
      .select("value")
      .eq("key", "hospitals_capacity")
      .single();

    return c.json({ hospitals: data?.value || [] });
  } catch (error) {
    console.error("Hospitals fetch error:", error);
    return c.json({ error: "Failed to fetch hospitals" }, 500);
  }
});

// Update hospital capacity (Healthcare department only)
app.put("/make-server-dd0f68d8/healthcare/hospital/:id", async (c) => {
  try {
    const token = c.req.header("Authorization")?.split(" ")[1];
    
    if (!token || !token.startsWith("dept_")) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const session = await verifyDepartmentSession(token);
    if (!session) {
      return c.json({ error: "Invalid session" }, 401);
    }

    const hospitalId = c.req.param("id");
    const updates = await c.req.json();

    const { data: existingData } = await supabase
      .from("kv_store_dd0f68d8")
      .select("value")
      .eq("key", "hospitals_capacity")
      .single();

    const hospitals = existingData?.value || [];
    const updatedHospitals = hospitals.map((hospital: any) => {
      if (hospital.id === hospitalId) {
        return {
          ...hospital,
          ...updates,
          updated_by: session.name,
          updated_at: new Date().toISOString()
        };
      }
      return hospital;
    });

    await supabase
      .from("kv_store_dd0f68d8")
      .upsert({
        key: "hospitals_capacity",
        value: updatedHospitals,
        updated_at: new Date().toISOString()
      });

    return c.json({ success: true });
  } catch (error) {
    console.error("Hospital update error:", error);
    return c.json({ error: "Failed to update hospital" }, 500);
  }
});

// ============ DATA ANALYTICS ============

// Get analytics data
app.get("/make-server-dd0f68d8/analytics/summary", async (c) => {
  try {
    const token = c.req.header("Authorization")?.split(" ")[1];
    
    console.log("Analytics request - token:", token?.substring(0, 15) + '...');
    
    if (!token || !token.startsWith("dept_")) {
      console.log("Analytics request rejected - invalid token format");
      return c.json({ error: "Unauthorized - Department access required" }, 401);
    }

    // Fetch various data for analytics
    console.log("Fetching analytics data from database...");
    const [alertsData, disastersData, hospitalsData] = await Promise.all([
      supabase.from("kv_store_dd0f68d8").select("value").eq("key", "sos_alerts_all").single(),
      supabase.from("kv_store_dd0f68d8").select("value").eq("key", "disasters_active").single(),
      supabase.from("kv_store_dd0f68d8").select("value").eq("key", "hospitals_capacity").single()
    ]);
    
    console.log("Analytics data fetched - alerts:", alertsData.data ? "✓" : "✗", 
                "disasters:", disastersData.data ? "✓" : "✗", 
                "hospitals:", hospitalsData.data ? "✓" : "✗");

    const alerts = alertsData.data?.value || [];
    const disasters = disastersData.data?.value || [];
    const hospitals = hospitalsData.data?.value || [];
    
    console.log("Analytics data counts - alerts:", alerts.length, "disasters:", disasters.length, "hospitals:", hospitals.length);

    // Calculate statistics
    const activeAlerts = alerts.filter((a: any) => a.status === "active").length;
    const resolvedAlerts = alerts.filter((a: any) => a.status === "resolved").length;
    const totalDisasters = disasters.length;
    const criticalDisasters = disasters.filter((d: any) => d.severity === "critical").length;
    
    // Hospital statistics
    const totalBeds = hospitals.reduce((sum: number, h: any) => sum + (h.totalBeds || 0), 0);
    const availableBeds = hospitals.reduce((sum: number, h: any) => sum + (h.availableBeds || 0), 0);

    return c.json({
      alerts: {
        total: alerts.length,
        active: activeAlerts,
        resolved: resolvedAlerts
      },
      disasters: {
        total: totalDisasters,
        critical: criticalDisasters
      },
      healthcare: {
        totalHospitals: hospitals.length,
        totalBeds,
        availableBeds,
        occupancyRate: totalBeds > 0 ? ((totalBeds - availableBeds) / totalBeds * 100).toFixed(1) : "0"
      },
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error("Analytics fetch error:", error);
    return c.json({ error: "Failed to fetch analytics" }, 500);
  }
});

Deno.serve(app.fetch);
