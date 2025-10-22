import { projectId, publicAnonKey } from "./supabase/info";

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-dd0f68d8`;

// Helper function to make authenticated department requests
async function departmentRequest(
  endpoint: string,
  token: string,
  options: RequestInit = {}
) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        ...options.headers,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error(`Department API error for ${endpoint}:`, {
        status: response.status,
        statusText: response.statusText,
        error: data.error,
        token: token?.substring(0, 10) + '...'
      });
      throw new Error(data.error || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (error: any) {
    console.error(`Department API request failed for ${endpoint}:`, error.message);
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
  return departmentRequest(`/sos/alerts?status=${status}`, token);
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
  return departmentRequest(`/sos/alert/${alertId}`, token, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

// ============ DISASTER MONITORING ============

export async function getActiveDisasters(token: string) {
  return departmentRequest("/disasters/active", token);
}

export async function createDisasterEvent(token: string, eventData: any) {
  return departmentRequest("/disasters/event", token, {
    method: "POST",
    body: JSON.stringify(eventData),
  });
}

export async function updateDisasterEvent(token: string, eventData: any) {
  return departmentRequest("/disasters/event", token, {
    method: "POST",
    body: JSON.stringify(eventData),
  });
}

// ============ HEALTHCARE ============

export async function getHospitals() {
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
  return departmentRequest(`/healthcare/hospital/${hospitalId}`, token, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

// ============ ANALYTICS ============

export async function getAnalyticsSummary(token: string) {
  return departmentRequest("/analytics/summary", token);
}
