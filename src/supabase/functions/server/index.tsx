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
  return c.json({ 
    status: "ok", 
    service: "BantayAlert API",
    version: "2.0.0-token-fix",
    timestamp: new Date().toISOString(),
    tokenFormat: "dept_{base64payload}.{base64signature}"
  });
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
      },
      {
        id: "hosp_006",
        name: "St. Luke's Medical Center - BGC",
        location: "Taguig City",
        totalBeds: 650,
        availableBeds: 175,
        emergencyCapacity: 80,
        icuCapacity: 35,
        status: "operational",
        contact: "+63 2 7789 7700",
        updated_at: new Date().toISOString()
      },
      {
        id: "hosp_007",
        name: "Taguig-Pateros District Hospital",
        location: "Taguig City",
        totalBeds: 200,
        availableBeds: 58,
        emergencyCapacity: 40,
        icuCapacity: 12,
        status: "operational",
        contact: "+63 2 8789 2345",
        updated_at: new Date().toISOString()
      },
      {
        id: "hosp_008",
        name: "Las Piñas General Hospital",
        location: "Las Piñas City",
        totalBeds: 350,
        availableBeds: 82,
        emergencyCapacity: 55,
        icuCapacity: 18,
        status: "operational",
        contact: "+63 2 8874 0101",
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
        evacuationCenters: [
          {
            name: "Marikina Sports Center",
            capacity: 500,
            current: 450,
            address: "Sumulong Highway, Marikina City"
          }
        ],
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
        evacuees: 820,
        evacuationCenters: [
          {
            name: "QC Memorial Circle Gymnasium",
            capacity: 800,
            current: 520,
            address: "Elliptical Road, Quezon City"
          },
          {
            name: "Rizal Park Gymnasium",
            capacity: 400,
            current: 300,
            address: "Roxas Boulevard, Manila"
          }
        ],
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
    
    // Initialize sample SOS alerts
    const sampleSOSAlerts = [
      {
        id: "sos_001",
        userEmail: "maria.santos@email.com",
        userName: "Maria Santos",
        contactNumber: "+63 917 123 4567",
        location: { 
          lat: 14.6507, 
          lng: 121.1029, 
          address: "Brgy. Tumana, Marikina City - Near Marikina River"
        },
        details: "House is flooding rapidly, water level rising. Need immediate evacuation assistance.",
        priority: "critical",
        status: "active",
        created_at: new Date(Date.now() - 1800000).toISOString(),
        updated_at: new Date().toISOString(),
        responded_by: null,
        resolution: null
      },
      {
        id: "sos_002",
        userEmail: "juan.cruz@email.com",
        userName: "Juan Cruz",
        contactNumber: "+63 918 234 5678",
        location: { 
          lat: 14.6760, 
          lng: 121.0437, 
          address: "123 Commonwealth Ave, Quezon City"
        },
        details: "Elderly person trapped on second floor due to flooding. Medical assistance needed.",
        priority: "high",
        status: "responding",
        created_at: new Date(Date.now() - 3600000).toISOString(),
        updated_at: new Date().toISOString(),
        responded_by: "Emergency Responder",
        resolution: null,
        responseProgress: "enroute"
      },
      {
        id: "sos_003",
        userEmail: "ana.reyes@email.com",
        userName: "Ana Reyes",
        contactNumber: "+63 919 345 6789",
        location: { 
          lat: 14.5995, 
          lng: 120.9842, 
          address: "Barangay Pio del Pilar, Makati City"
        },
        details: "Power outage and strong winds. Tree fell near house, blocking exit.",
        priority: "medium",
        status: "active",
        created_at: new Date(Date.now() - 7200000).toISOString(),
        updated_at: new Date().toISOString(),
        responded_by: null,
        resolution: null
      }
    ];

    const { error: sosError } = await supabase
      .from("kv_store_dd0f68d8")
      .upsert({
        key: "sos_alerts_all",
        value: sampleSOSAlerts,
        updated_at: new Date().toISOString()
      });

    if (sosError) {
      console.error("Error initializing SOS alerts:", sosError);
      throw sosError;
    }
    
    // Also save to active alerts
    const activeSOSAlerts = sampleSOSAlerts.filter(alert => alert.status === "active" || alert.status === "responding");
    const { error: sosActiveError } = await supabase
      .from("kv_store_dd0f68d8")
      .upsert({
        key: "sos_alerts_active",
        value: activeSOSAlerts,
        updated_at: new Date().toISOString()
      });

    if (sosActiveError) {
      console.error("Error initializing active SOS alerts:", sosActiveError);
      throw sosActiveError;
    }
    
    console.log("✓ SOS alerts initialized");
    console.log("✓ All sample data initialized successfully");

    return c.json({ 
      success: true, 
      message: "Sample data initialized",
      data: {
        hospitals: sampleHospitals.length,
        disasters: sampleDisasters.length,
        sosAlerts: sampleSOSAlerts.length
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

// Simple token encoding/decoding (for prototype - in production use JWT)
function createDepartmentToken(email: string, role: string, name: string, department: string): string {
  const payload = {
    email,
    role,
    name,
    department,
    timestamp: Date.now()
  };
  // Base64 encode the payload with a simple signature
  const payloadStr = JSON.stringify(payload);
  const signature = btoa(`${payloadStr}:BANTAY_SECRET_KEY_2025`);
  return `dept_${btoa(payloadStr)}.${signature}`;
}

function verifyDepartmentToken(token: string): any {
  try {
    if (!token || !token.startsWith("dept_")) {
      console.log("Token verification failed: Invalid format or missing dept_ prefix");
      return null;
    }
    
    // Extract payload and signature
    const parts = token.substring(5).split('.');
    if (parts.length !== 2) {
      console.log("Token verification failed: Invalid token structure. Token might be from old format.");
      console.log("Please sign out and sign back in to get a new token.");
      return null;
    }
    
    const [payloadB64, signature] = parts;
    
    try {
      const payloadStr = atob(payloadB64);
      const expectedSignature = btoa(`${payloadStr}:BANTAY_SECRET_KEY_2025`);
      
      // Verify signature
      if (signature !== expectedSignature) {
        console.log("Invalid token signature");
        return null;
      }
      
      const payload = JSON.parse(payloadStr);
      
      // Verify the email exists in our credentials
      if (!DEPARTMENT_CREDENTIALS[payload.email as keyof typeof DEPARTMENT_CREDENTIALS]) {
        console.log("Invalid department email in token");
        return null;
      }
      
      console.log("✓ Token verified for:", payload.name, payload.role);
      return payload;
    } catch (decodeError: any) {
      console.log("Token decode error:", decodeError.message);
      return null;
    }
  } catch (error: any) {
    console.log("Token verification error:", error.message);
    return null;
  }
}

// Department sign-in endpoint
app.post("/make-server-dd0f68d8/department/signin", async (c) => {
  try {
    console.log("🔐 Department sign-in request received");
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: "Missing email or password" }, 400);
    }

    const dept = DEPARTMENT_CREDENTIALS[email as keyof typeof DEPARTMENT_CREDENTIALS];
    
    if (!dept || dept.password !== password) {
      console.log("❌ Invalid credentials for:", email);
      return c.json({ error: "Invalid department credentials" }, 401);
    }

    // Create a session token for the department
    const sessionToken = createDepartmentToken(email, dept.role, dept.name, dept.department);
    
    console.log("✅ Creating department session for:", dept.name);
    console.log("Token format check:");
    console.log("  - Starts with dept_:", sessionToken.startsWith("dept_"));
    console.log("  - Has period:", sessionToken.includes("."));
    console.log("  - Parts count:", sessionToken.substring(5).split(".").length);
    console.log("  - First 40 chars:", sessionToken.substring(0, 40) + "...");
    
    // Store session
    const { error: sessionError } = await supabase
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

    if (sessionError) {
      console.error("Failed to store department session:", sessionError);
      return c.json({ error: "Failed to create session" }, 500);
    }
    
    console.log("✓ Department session created successfully");
    
    // Verify session was stored correctly
    const { data: verifyData, error: verifyError } = await supabase
      .from("kv_store_dd0f68d8")
      .select("value")
      .eq("key", `dept_session_${sessionToken}`)
      .single();
    
    if (verifyError || !verifyData) {
      console.error("❌ Session verification failed immediately after creation:", verifyError);
      return c.json({ error: "Session creation verification failed" }, 500);
    }
    
    console.log("✓ Session verified immediately after creation");

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
    console.log("Verifying department session for token:", token.substring(0, 15) + '...');
    
    // First check if it's a valid token format
    if (!token || !token.startsWith("dept_")) {
      console.log("Invalid token format");
      return null;
    }
    
    const { data, error } = await supabase
      .from("kv_store_dd0f68d8")
      .select("value")
      .eq("key", `dept_session_${token}`)
      .single();
    
    if (error) {
      console.log("Session verification error:", error.message, error.code);
      
      // If session not found, return null
      if (error.code === "PGRST116") {
        console.log("Session not found in database");
        return null;
      }
      return null;
    }
    
    if (data?.value) {
      console.log("✓ Session found for:", data.value.name, data.value.role);
      return data.value;
    }
    
    console.log("No session data in response");
    return null;
  } catch (error: any) {
    console.log("Session verification exception:", error.message);
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
    const token = c.req.header("X-Department-Token");
    
    console.log("SOS alerts request - token:", token?.substring(0, 15) + '...');
    
    // Verify department token
    if (!token || !token.startsWith("dept_")) {
      console.log("SOS alerts request rejected - invalid token format");
      return c.json({ error: "Unauthorized - Department access only" }, 401);
    }

    const session = verifyDepartmentToken(token);
    if (!session) {
      console.log("SOS alerts request rejected - invalid token");
      return c.json({ error: "Invalid token" }, 401);
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
    const token = c.req.header("X-Department-Token");
    
    // Verify department token
    if (!token || !token.startsWith("dept_")) {
      return c.json({ error: "Unauthorized - Department access only" }, 401);
    }

    const session = verifyDepartmentToken(token);
    if (!session) {
      return c.json({ error: "Invalid token" }, 401);
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
    const token = c.req.header("X-Department-Token");
    
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
    const token = c.req.header("X-Department-Token");
    
    if (!token || !token.startsWith("dept_")) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const session = verifyDepartmentToken(token);
    if (!session) {
      return c.json({ error: "Invalid token" }, 401);
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
    const token = c.req.header("X-Department-Token");
    
    if (!token || !token.startsWith("dept_")) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const session = verifyDepartmentToken(token);
    if (!session) {
      return c.json({ error: "Invalid token" }, 401);
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
    const token = c.req.header("X-Department-Token");
    
    console.log("Analytics request - token:", token?.substring(0, 15) + '...');
    
    if (!token || !token.startsWith("dept_")) {
      console.log("Analytics request rejected - invalid token format");
      return c.json({ error: "Unauthorized - Department access required" }, 401);
    }

    // Verify department token
    const session = verifyDepartmentToken(token);
    if (!session) {
      console.log("Analytics request rejected - invalid token");
      return c.json({ error: "Invalid or expired token" }, 401);
    }
    
    console.log("Analytics request authorized for:", session.name);

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