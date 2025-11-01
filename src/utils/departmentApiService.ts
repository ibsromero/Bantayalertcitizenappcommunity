import { projectId, publicAnonKey } from "./supabase/info";
import { 
  MOCK_SOS_ALERTS, 
  MOCK_ACTIVE_DISASTERS, 
  MOCK_HOSPITALS, 
  MOCK_ANALYTICS_SUMMARY,
  shouldUseMockData 
} from "./mockDepartmentData";

const API_BASE = `https://gzefyknnjlsjmcgndbfn.supabase.co/functions/v1/departmentApiService`;
const USE_MOCK_DATA = true; // Set to false when Edge Function is deployed

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
  const response = await fetch(`${API_BASE}/sos/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${publicAnonKey}`,
    },
    body: JSON.stringify(alertData),
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || "Failed to create SOS alert");
  }

  return data;
}

export async function getSOSAlerts(token: string, status: "active" | "all" = "active") {
  if (USE_MOCK_DATA) {
    console.log("📦 Using mock SOS alerts data (Edge Function not deployed)");
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
    
    const alerts = status === "active" 
      ? MOCK_SOS_ALERTS.filter(a => a.status === "active" || a.status === "responding")
      : MOCK_SOS_ALERTS;
    
    return { alerts };
  }
  
  try {
    return await departmentRequest(`/sos/alerts?status=${status}`, token);
  } catch (error: any) {
    if (shouldUseMockData(error)) {
      console.log("⚠️ API failed, falling back to mock SOS alerts data");
      const alerts = status === "active" 
        ? MOCK_SOS_ALERTS.filter(a => a.status === "active" || a.status === "responding")
        : MOCK_SOS_ALERTS;
      return { alerts };
    }
    throw error;
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
  if (USE_MOCK_DATA) {
    console.log("📦 Simulating SOS alert update (Edge Function not deployed)");
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
    // In mock mode, we just simulate success without actually updating data
    return { success: true };
  }
  
  return departmentRequest(`/sos/alert/${alertId}`, token, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
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
    if (shouldUseMockData(error)) {
      console.log("⚠️ API failed, falling back to mock disasters data");
      return { disasters: MOCK_ACTIVE_DISASTERS };
    }
    throw error;
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
    if (shouldUseMockData(error)) {
      console.log("⚠️ API failed, falling back to mock hospitals data");
      return { hospitals: MOCK_HOSPITALS };
    }
    throw error;
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
    if (shouldUseMockData(error)) {
      console.log("⚠️ API failed, falling back to mock analytics data");
      return MOCK_ANALYTICS_SUMMARY;
    }
    throw error;
  }
}
