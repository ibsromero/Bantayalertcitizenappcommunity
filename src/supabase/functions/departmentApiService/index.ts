import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-department-token",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE",
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Department credentials
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

// Token verification
function verifyDepartmentToken(token: string): any {
  try {
    if (!token || !token.startsWith("dept_")) {
      return null;
    }
    
    const parts = token.substring(5).split('.');
    if (parts.length !== 2) {
      return null;
    }
    
    const [payloadB64, signature] = parts;
    
    try {
      const payloadStr = atob(payloadB64);
      const expectedSignature = btoa(`${payloadStr}:BANTAY_SECRET_KEY_2025`);
      
      if (signature !== expectedSignature) {
        return null;
      }
      
      const payload = JSON.parse(payloadStr);
      
      if (!DEPARTMENT_CREDENTIALS[payload.email as keyof typeof DEPARTMENT_CREDENTIALS]) {
        return null;
      }
      
      return payload;
    } catch {
      return null;
    }
  } catch {
    return null;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname;

    // Get department token from headers
    const token = req.headers.get("x-department-token");

    // Analytics summary endpoint
    if (path.endsWith("/analytics/summary") && req.method === "GET") {
      console.log("📊 Analytics request received");
      
      if (!token) {
        return new Response(
          JSON.stringify({ error: "Unauthorized - No token provided" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const session = verifyDepartmentToken(token);
      if (!session) {
        return new Response(
          JSON.stringify({ error: "Invalid token" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log("✓ Token verified for:", session.name);

      // Fetch analytics data
      const [alertsData, disastersData, hospitalsData] = await Promise.all([
        supabase.from("kv_store_dd0f68d8").select("value").eq("key", "sos_alerts_all").single(),
        supabase.from("kv_store_dd0f68d8").select("value").eq("key", "disasters_active").single(),
        supabase.from("kv_store_dd0f68d8").select("value").eq("key", "hospitals_capacity").single()
      ]);

      const alerts = alertsData.data?.value || [];
      const disasters = disastersData.data?.value || [];
      const hospitals = hospitalsData.data?.value || [];

      const activeAlerts = alerts.filter((a: any) => a.status === "active").length;
      const resolvedAlerts = alerts.filter((a: any) => a.status === "resolved").length;
      const totalDisasters = disasters.length;
      const criticalDisasters = disasters.filter((d: any) => d.severity === "critical").length;
      
      const totalBeds = hospitals.reduce((sum: number, h: any) => sum + (h.totalBeds || 0), 0);
      const availableBeds = hospitals.reduce((sum: number, h: any) => sum + (h.availableBeds || 0), 0);

      return new Response(
        JSON.stringify({
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
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // SOS alerts endpoint
    if (path.includes("/sos/alerts") && req.method === "GET") {
      console.log("🚨 SOS alerts request received");
      
      if (!token) {
        return new Response(
          JSON.stringify({ error: "Unauthorized - No token provided" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const session = verifyDepartmentToken(token);
      if (!session) {
        return new Response(
          JSON.stringify({ error: "Invalid token" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const status = url.searchParams.get("status") || "active";
      const key = status === "all" ? "sos_alerts_all" : "sos_alerts_active";

      const { data } = await supabase
        .from("kv_store_dd0f68d8")
        .select("value")
        .eq("key", key)
        .single();

      const alerts = data?.value || [];
      const filteredAlerts = status === "active" 
        ? alerts.filter((alert: any) => alert.status === "active")
        : alerts;

      return new Response(
        JSON.stringify({ alerts: filteredAlerts }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Healthcare/hospitals endpoint
    if (path.includes("/healthcare/hospitals") && req.method === "GET") {
      console.log("🏥 Hospitals request received");

      const { data } = await supabase
        .from("kv_store_dd0f68d8")
        .select("value")
        .eq("key", "hospitals_capacity")
        .single();

      return new Response(
        JSON.stringify({ hospitals: data?.value || [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Disasters endpoint
    if (path.includes("/disasters/active") && req.method === "GET") {
      console.log("🌪️ Disasters request received");
      
      if (!token) {
        return new Response(
          JSON.stringify({ error: "Unauthorized - No token provided" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const session = verifyDepartmentToken(token);
      if (!session) {
        return new Response(
          JSON.stringify({ error: "Invalid token" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data } = await supabase
        .from("kv_store_dd0f68d8")
        .select("value")
        .eq("key", "disasters_active")
        .single();

      return new Response(
        JSON.stringify({ disasters: data?.value || [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create SOS alert endpoint (no auth required - for citizens)
    if (path.includes("/sos/create") && req.method === "POST") {
      console.log("🚨 SOS alert creation request received");
      
      const body = await req.json();
      const { userEmail, userName, location, details, contactNumber } = body;

      if (!userName) {
        return new Response(
          JSON.stringify({ error: "Missing required field: userName" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const alertId = `sos_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const sosAlert = {
        id: alertId,
        userEmail: userEmail || "Not provided",
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

      try {
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

        console.log("✅ SOS alert created:", alertId);

        return new Response(
          JSON.stringify({ success: true, alertId }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (error: any) {
        console.error("❌ Failed to create SOS alert:", error);
        return new Response(
          JSON.stringify({ error: "Failed to create SOS alert", details: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Default 404
    return new Response(
      JSON.stringify({ error: "Not found" }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
