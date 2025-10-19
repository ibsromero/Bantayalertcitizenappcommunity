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

Deno.serve(app.fetch);
