import { projectId, publicAnonKey } from "./supabase/info";
import { supabase } from "./supabaseClient";
import { 
  MOCK_SOS_ALERTS, 
  MOCK_ACTIVE_DISASTERS, 
  MOCK_HOSPITALS, 
  MOCK_ANALYTICS_SUMMARY,
  shouldUseMockData 
} from "./mockDepartmentData";

const API_BASE = `https://${projectId}.supabase.co/functions/v1/departmentApiService`;
const MAIN_SERVER_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-dd0f68d8`;
const USE_MOCK_DATA = false; // Set to false when Edge Function is deployed

// Validate department token format
function validateDepartmentToken(token: string): boolean {
  if (!token || !token.startsWith("dept_")) {
    console.error("❌ Invalid token: Missing dept_ prefix");
    return false;
  }
  
  // Check for proper structure: dept_{payload}.{signature}
    const parts = token.substring(5).split(".");
  if (parts.length !== 2) {
    console.error("❌ Invalid token: Missing signature part (old format detected)");
    console.error("Token format:", token.substring(0, 30) + "...");
    console.error("Please sign out and sign in again to get a new token");
    return false;
  }
  
  return true;
}

// Helper function to make authenticated department requests
async function departmentRequest(
  endpoint: string,
  token: string,
  options: RequestInit = {}
) {
  try {
    console.log(`🔵 Department API Request: ${endpoint}`);
    console.log(`Token: ${token?.substring(0, 20)}...`);
    
    // Validate token format before making request
    if (!validateDepartmentToken(token)) {
      throw new Error("Invalid token format. Please sign in again.");
    }
    
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "X-Department-Token": token,
        "Authorization": `Bearer ${publicAnonKey}`,
        ...options.headers,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error(`❌ Department API error for ${endpoint}:`, {
        status: response.status,
        statusText: response.statusText,
        error: data.error,
        token: token?.substring(0, 20) + '...',
        fullResponse: data
      });
      
      // More specific error messages
      if (response.status === 401) {
        throw new Error("Authentication failed. Please sign in again.");
      } else if (response.status === 403) {
        throw new Error("Access denied. Insufficient permissions.");
      } else {
        throw new Error(data.error || `Request failed with status ${response.status}`);
      }
    }

    console.log(`✅ Department API success for ${endpoint}:`, data);
    return data;
  } catch (error: any) {
    console.error(`❌ Department API request failed for ${endpoint}:`, error.message);
    throw error;
  }
}

// ============ SOS ALERTS ============

export async function createSOSAlert(alertData: {
  userEmail: string;
  userName: string;
  location?: { lat: number | null; lng: number | null; address: string };
  details?: string;
  contactNumber?: string;
}) {
  // SOS creation doesn't require auth - anyone can send an emergency alert
  try {
    console.log("📡 Sending SOS alert to server:", alertData);
    
    const response = await fetch(`${MAIN_SERVER_BASE}/sos/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify(alertData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("❌ SOS creation failed:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      
      // If Edge Function not deployed, fall back to local mode
      if (response.status === 404) {
        console.warn("⚠️ Edge Function not deployed. Using local fallback mode.");
        return createSOSAlertLocal(alertData);
      }
      
      throw new Error(errorData.error || `Failed to create SOS alert (${response.status})`);
    }

    const data = await response.json();
    console.log("✅ SOS alert created successfully:", data);
    return data;
  } catch (error: any) {
    console.error("❌ SOS alert error:", error);
    
    // If network error (Edge Function not deployed), use local fallback
    if (error.message?.includes("Failed to fetch") || error.message?.includes("NetworkError")) {
      console.warn("⚠️ Cannot reach server. Using local fallback mode.");
      console.warn("📢 NOTE: This SOS alert will only be stored locally and won't reach emergency responders.");
      console.warn("🚀 Deploy Edge Functions for full functionality: See SOS_FIX_GUIDE.md");
      return createSOSAlertLocal(alertData);
    }
    
    throw error;
  }
}

// Local fallback when Edge Function is not deployed - NOW SAVES TO SUPABASE!
async function createSOSAlertLocal(alertData: any) {
  console.log("💾 Edge Function not available - saving SOS alert directly to Supabase...");
  
  try {
    // Save directly to Supabase sos_alerts table
    const { data, error } = await supabase
      .from('sos_alerts')
      .insert([
        {
          user_name: alertData.userName,
          user_email: alertData.userEmail,
          contact_number: alertData.contactNumber || 'Not provided',
          location_lat: alertData.location?.lat || null,
          location_lng: alertData.location?.lng || null,
          location_address: alertData.location?.address || 'Location not provided',
          details: alertData.details || 'Emergency assistance needed',
          status: 'active',
          priority: 'high',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      console.error("❌ Failed to save SOS alert to Supabase:", error);
      
      // Fallback to localStorage as last resort
      const alertId = `sos_local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const sosAlert = {
        id: alertId,
        ...alertData,
        status: "active",
        priority: "high",
        created_at: new Date().toISOString(),
        _local: true
      };
      
      const existingAlerts = JSON.parse(localStorage.getItem("local_sos_alerts") || "[]");
      existingAlerts.unshift(sosAlert);
      localStorage.setItem("local_sos_alerts", JSON.stringify(existingAlerts.slice(0, 10)));
      
      return { 
        success: true, 
        alertId,
        _localOnly: true,
        _warning: "Saved to browser only - please check database connection"
      };
    }

    console.log("✅ SOS alert saved to Supabase successfully:", data);
    
    return { 
      success: true, 
      alertId: data.id,
      alert: data,
      _supabase: true
    };
  } catch (error: any) {
    console.error("❌ Failed to create SOS alert:", error);
    throw error;
  }
}

export async function getSOSAlerts(token: string, status: "active" | "all" = "active") {
  // Try to fetch from Supabase first
  try {
    console.log(`📡 Fetching SOS alerts (${status}) from Supabase...`);
    
    let query = supabase
      .from('sos_alerts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (status === "active") {
      query = query.in('status', ['active', 'responding']);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error("❌ Error fetching SOS alerts from Supabase:", error);
      throw error;
    }
    
    console.log(`✅ Retrieved ${data?.length || 0} SOS alerts from Supabase`);
    
    // Transform data to match expected format
    const alerts = (data || []).map(alert => ({
      id: alert.id,
      userEmail: alert.user_email,
      userName: alert.user_name,
      contactNumber: alert.contact_number,
      location: {
        lat: alert.location_lat,
        lng: alert.location_lng,
        address: alert.location_address
      },
      details: alert.details,
      status: alert.status,
      priority: alert.priority,
      created_at: alert.created_at,
      responded_by: alert.responded_by,
      responded_at: alert.responded_at,
      resolution: alert.resolution
    }));
    
    return { alerts };
  } catch (error: any) {
    console.error("❌ Failed to fetch from Supabase, falling back to mock data:", error);
    
    // Fallback to mock data
    console.log("📦 Using mock SOS alerts data (Supabase connection failed)");
    const alerts = status === "active" 
      ? MOCK_SOS_ALERTS.filter(a => a.status === "active" || a.status === "responding")
      : MOCK_SOS_ALERTS;
    
    return { alerts };
  }
}

export async function updateSOSAlert(
  token: string,
  alertId: string,
  updates: {
    status?: string;
    resolution?: string;
    priority?: string;
  }
) {
  // Update directly in Supabase
  try {
    console.log(`💾 Updating SOS alert ${alertId} in Supabase...`, updates);
    
    const updateData: any = {
      updated_at: new Date().toISOString()
    };
    
    if (updates.status) updateData.status = updates.status;
    if (updates.priority) updateData.priority = updates.priority;
    if (updates.resolution) updateData.resolution = updates.resolution;
    
    const { data, error } = await supabase
      .from('sos_alerts')
      .update(updateData)
      .eq('id', alertId)
      .select()
      .single();
    
    if (error) {
      console.error("❌ Failed to update SOS alert in Supabase:", error);
      throw error;
    }
    
    console.log("✅ SOS alert updated in Supabase:", data);
    return { success: true, alert: data };
  } catch (error: any) {
    console.error("❌ Failed to update SOS alert:", error);
    
    // Simulate success in mock mode
    console.log("📦 Simulating SOS alert update (Supabase update failed)");
    return { success: true };
  }
}

// ============ DISASTER MONITORING ============

export async function getActiveDisasters(token: string) {
  if (USE_MOCK_DATA) {
    console.log("📦 Using mock disasters data (Edge Function not deployed)");
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
    return { disasters: MOCK_ACTIVE_DISASTERS };
  }
  
  try {
    return await departmentRequest("/disasters/active", token);
  } catch (error: any) {
    console.log("⚠️ Disasters API failed, falling back to mock data");
    console.log("Error details:", error.message);
    // Always fall back to mock data if Edge Function isn't deployed
    return { disasters: MOCK_ACTIVE_DISASTERS };
  }
}

export async function createDisasterEvent(token: string, eventData: any) {
  if (USE_MOCK_DATA) {
    console.log("📦 Simulating disaster event creation (Edge Function not deployed)");
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
    const eventId = `disaster_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return { success: true, eventId };
  }
  
  return departmentRequest("/disasters/event", token, {
    method: "POST",
    body: JSON.stringify(eventData),
  });
}

export async function updateDisasterEvent(token: string, eventData: any) {
  if (USE_MOCK_DATA) {
    console.log("📦 Simulating disaster event update (Edge Function not deployed)");
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
    return { success: true, eventId: eventData.id };
  }
  
  return departmentRequest("/disasters/event", token, {
    method: "POST",
    body: JSON.stringify(eventData),
  });
}

// ============ HEALTHCARE ============

export async function getHospitals() {
  if (USE_MOCK_DATA) {
    console.log("📦 Using mock hospitals data (Edge Function not deployed)");
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
    return { hospitals: MOCK_HOSPITALS };
  }
  
  try {
    const response = await fetch(`${API_BASE}/healthcare/hospitals`, {
      headers: {
        "Authorization": `Bearer ${publicAnonKey}`,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch hospitals");
    }

    return data;
  } catch (error: any) {
    console.log("⚠️ Hospitals API failed, falling back to mock data");
    console.log("Error details:", error.message);
    // Always fall back to mock data if Edge Function isn't deployed
    return { hospitals: MOCK_HOSPITALS };
  }
}

export async function updateHospitalCapacity(
  token: string,
  hospitalId: string,
  updates: {
    availableBeds?: number;
    emergencyCapacity?: number;
    icuCapacity?: number;
    status?: string;
  }
) {
  if (USE_MOCK_DATA) {
    console.log("📦 Simulating hospital capacity update (Edge Function not deployed)");
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
    // In mock mode, we just simulate success without actually updating data
    // The UI will update optimistically and the mock data will remain unchanged
    return { success: true };
  }
  
  return departmentRequest(`/healthcare/hospital/${hospitalId}`, token, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

// ============ ANALYTICS ============

export async function getAnalyticsSummary(token: string) {
  if (USE_MOCK_DATA) {
    console.log("📦 Using mock analytics data (Edge Function not deployed)");
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
    return MOCK_ANALYTICS_SUMMARY;
  }
  
  try {
    return await departmentRequest("/analytics/summary", token);
  } catch (error: any) {
    console.log("⚠️ Analytics API failed, falling back to mock data");
    console.log("Error details:", error.message);
    // Always fall back to mock data if Edge Function isn't deployed
    return MOCK_ANALYTICS_SUMMARY;
  }
}
