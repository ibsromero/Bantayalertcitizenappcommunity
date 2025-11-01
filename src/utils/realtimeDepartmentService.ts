/**
 * Real-Time Department Service
 * Uses Supabase directly for real-time communication between citizens and departments
 * No Edge Functions required - everything works through Supabase database
 */

import { supabase } from "./supabaseClient";
import type { RealtimeChannel } from "@supabase/supabase-js";

// ============================================
// TYPES
// ============================================

export interface SOSAlert {
  id: string;
  user_email: string;
  user_name: string;
  contact_number?: string;
  location_latitude?: number;
  location_longitude?: number;
  location_address?: string;
  details?: string;
  status: "active" | "responding" | "resolved" | "cancelled";
  priority: "critical" | "high" | "medium" | "low";
  assigned_department_id?: string;
  resolution?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

export interface DisasterEvent {
  id: string;
  disaster_type: "typhoon" | "earthquake" | "flood" | "fire" | "other";
  title: string;
  description?: string;
  severity: "minor" | "moderate" | "major" | "catastrophic";
  status: "active" | "monitoring" | "resolved";
  affected_areas?: string[];
  location_latitude?: number;
  location_longitude?: number;
  casualties_reported?: number;
  families_affected?: number;
  evacuation_centers_active?: number;
  created_by_department_id?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  city: string;
  contact_number?: string;
  hospital_type: "government" | "private" | "specialty";
  total_beds: number;
  available_beds: number;
  icu_capacity: number;
  emergency_capacity: number;
  has_emergency_room: boolean;
  has_trauma_center: boolean;
  location_latitude?: number;
  location_longitude?: number;
  status: "operational" | "limited" | "full" | "offline";
  last_updated_by?: string;
  created_at: string;
  updated_at: string;
}

export interface WeatherWarning {
  id: string;
  warning_type: "typhoon" | "flood" | "earthquake" | "severe_weather";
  title: string;
  description: string;
  severity: "advisory" | "warning" | "critical";
  affected_areas?: string[];
  issued_by_department_id?: string;
  issued_by_department_name?: string;
  valid_from: string;
  valid_until?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AnalyticsSummary {
  id: string;
  total_sos_alerts: number;
  active_sos_alerts: number;
  total_disasters: number;
  active_disasters: number;
  total_hospitals: number;
  hospitals_at_capacity: number;
  avg_response_time_minutes: number;
  citizens_helped_today: number;
  updated_at: string;
}

export interface DepartmentUser {
  id: string;
  email: string;
  department_name: string;
  department_type: "lgu" | "emergency_responder" | "healthcare" | "disaster_management";
  city: string;
  contact_number?: string;
  is_active: boolean;
}

// ============================================
// DEPARTMENT AUTHENTICATION
// ============================================

/**
 * Authenticate department user
 * Uses simple password verification - see setupDepartmentPasswords.ts for credentials
 */
export async function authenticateDepartment(
  email: string,
  password: string
): Promise<{ user: DepartmentUser | null; token: string | null; error: string | null }> {
  try {
    // Import password verification (avoiding circular dependency)
    const { verifyDepartmentLogin } = await import("./setupDepartmentPasswords");
    
    const result = await verifyDepartmentLogin(email, password);
    
    if (result.error || !result.user) {
      return { user: null, token: null, error: result.error || "Authentication failed" };
    }

    console.log("✅ Department authentication successful:", result.user.department_name);

    return {
      user: result.user,
      token: result.token,
      error: null,
    };
  } catch (error: any) {
    console.error("❌ Department authentication error:", error);
    return { user: null, token: null, error: error.message };
  }
}

// ============================================
// SOS ALERTS - REAL-TIME
// ============================================

/**
 * Create SOS Alert (called by citizens)
 * FALLBACK MODE: Uses kv_store until proper tables are created
 */
export async function createSOSAlert(alertData: {
  userEmail: string;
  userName: string;
  location?: { lat: number | null; lng: number | null; address: string };
  details?: string;
  contactNumber?: string;
}) {
  try {
    console.log("📝 Creating SOS alert via kv_store fallback...");
    
    // Try table-based approach first (will work once tables are created)
    try {
      const { data, error } = await supabase
        .from("sos_alerts")
        .insert({
          user_email: alertData.userEmail,
          user_name: alertData.userName,
          contact_number: alertData.contactNumber,
          location_latitude: alertData.location?.lat,
          location_longitude: alertData.location?.lng,
          location_address: alertData.location?.address,
          details: alertData.details,
          status: "active",
          priority: "high",
        })
        .select()
        .single();

      if (!error && data) {
        console.log("✅ SOS Alert created in table:", data.id);
        return { success: true, alert: data };
      }
    } catch (tableError) {
      console.log("⚠️ Table not available, using kv_store fallback");
    }

    // Fallback: Use kv_store
    const newAlert = {
      id: `sos_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_email: alertData.userEmail,
      user_name: alertData.userName,
      contact_number: alertData.contactNumber,
      location_latitude: alertData.location?.lat,
      location_longitude: alertData.location?.lng,
      location_address: alertData.location?.address,
      details: alertData.details,
      status: "active",
      priority: "high",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Get existing alerts
    const { data: kvData } = await supabase
      .from("kv_store_dd0f68d8")
      .select("value")
      .eq("key", "sos_alerts_active")
      .single();

    const existingAlerts = kvData?.value || [];
    const updatedAlerts = [newAlert, ...existingAlerts];

    // Save to kv_store
    await supabase
      .from("kv_store_dd0f68d8")
      .upsert({
        key: "sos_alerts_active",
        value: updatedAlerts,
        updated_at: new Date().toISOString()
      });

    console.log("✅ SOS Alert created in kv_store:", newAlert.id);
    return { success: true, alert: newAlert };
  } catch (error: any) {
    console.error("❌ Failed to create SOS alert:", error);
    throw new Error(error.message || "Failed to create SOS alert");
  }
}

/**
 * Get SOS Alerts (for departments)
 * FALLBACK MODE: Uses kv_store until proper tables are created
 */
export async function getSOSAlerts(status: "active" | "all" = "active"): Promise<{ alerts: SOSAlert[] }> {
  try {
    console.log(`📊 Fetching SOS alerts (${status}) via kv_store fallback...`);
    
    // Try table-based approach first
    try {
      let query = supabase
        .from("sos_alerts")
        .select("*")
        .order("created_at", { ascending: false });

      if (status === "active") {
        query = query.in("status", ["active", "responding"]);
      }

      const { data, error } = await query;

      if (!error && data) {
        console.log(`✅ Retrieved ${data.length} SOS alerts from table`);
        return { alerts: data };
      }
    } catch (tableError) {
      console.log("⚠️ Table not available, using kv_store fallback");
    }

    // Fallback: Use kv_store
    const key = status === "all" ? "sos_alerts_all" : "sos_alerts_active";
    const { data: kvData } = await supabase
      .from("kv_store_dd0f68d8")
      .select("value")
      .eq("key", key)
      .single();

    const alerts = kvData?.value || [];
    console.log(`✅ Retrieved ${alerts.length} SOS alerts from kv_store`);
    return { alerts };
  } catch (error: any) {
    console.error("❌ Failed to get SOS alerts:", error);
    // Return empty array instead of throwing
    return { alerts: [] };
  }
}

/**
 * Update SOS Alert (for departments)
 * FALLBACK MODE: Uses kv_store until proper tables are created
 */
export async function updateSOSAlert(
  alertId: string,
  updates: {
    status?: string;
    resolution?: string;
    priority?: string;
    assigned_department_id?: string;
  }
) {
  try {
    console.log(`📝 Updating SOS alert ${alertId} via kv_store fallback...`);
    
    const updateData: any = { ...updates };
    
    // Set resolved_at when status changes to resolved
    if (updates.status === "resolved") {
      updateData.resolved_at = new Date().toISOString();
    }

    // Try table-based approach first
    try {
      const { data, error } = await supabase
        .from("sos_alerts")
        .update(updateData)
        .eq("id", alertId)
        .select()
        .single();

      if (!error && data) {
        console.log("✅ SOS Alert updated in table:", alertId);
        return { success: true, alert: data };
      }
    } catch (tableError) {
      console.log("⚠️ Table not available, using kv_store fallback");
    }

    // Fallback: Update in kv_store
    const { data: kvData } = await supabase
      .from("kv_store_dd0f68d8")
      .select("value")
      .eq("key", "sos_alerts_active")
      .single();

    const alerts = kvData?.value || [];
    const updatedAlerts = alerts.map((alert: any) => 
      alert.id === alertId 
        ? { ...alert, ...updateData, updated_at: new Date().toISOString() }
        : alert
    );

    await supabase
      .from("kv_store_dd0f68d8")
      .upsert({
        key: "sos_alerts_active",
        value: updatedAlerts,
        updated_at: new Date().toISOString()
      });

    const updatedAlert = updatedAlerts.find((a: any) => a.id === alertId);
    console.log("✅ SOS Alert updated in kv_store:", alertId);
    return { success: true, alert: updatedAlert };
  } catch (error: any) {
    console.error("❌ Failed to update SOS alert:", error);
    throw new Error(error.message || "Failed to update SOS alert");
  }
}

/**
 * Subscribe to real-time SOS alerts
 * NOTE: Real-time only works once proper tables are created
 */
export function subscribeToSOSAlerts(
  callback: (payload: any) => void
): RealtimeChannel {
  console.log("🔴 Attempting to subscribe to real-time SOS alerts...");
  
  try {
    const channel = supabase
      .channel("sos-alerts-channel")
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to INSERT, UPDATE, DELETE
          schema: "public",
          table: "sos_alerts",
        },
        (payload) => {
          console.log("🔴 Real-time SOS alert update:", payload);
          callback(payload);
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("✅ Subscribed to SOS alerts channel");
        } else {
          console.log("⚠️ SOS subscription status:", status);
        }
      });

    return channel;
  } catch (error) {
    console.log("⚠️ Real-time subscription failed (tables not ready), returning mock channel");
    // Return a mock channel that won't crash
    return supabase.channel("sos-alerts-mock");
  }
}

// ============================================
// DISASTER EVENTS
// ============================================

/**
 * Get Active Disasters
 * FALLBACK MODE: Uses kv_store until proper tables are created
 */
export async function getActiveDisasters(): Promise<{ disasters: DisasterEvent[] }> {
  try {
    console.log("📊 Fetching active disasters via kv_store fallback...");
    
    // Try table-based approach first
    try {
      const { data, error } = await supabase
        .from("disaster_events")
        .select("*")
        .in("status", ["active", "monitoring"])
        .order("created_at", { ascending: false });

      if (!error && data) {
        console.log(`✅ Retrieved ${data.length} active disasters from table`);
        return { disasters: data };
      }
    } catch (tableError) {
      console.log("⚠️ Table not available, using kv_store fallback");
    }

    // Fallback: Use kv_store
    const { data: kvData } = await supabase
      .from("kv_store_dd0f68d8")
      .select("value")
      .eq("key", "disasters_active")
      .single();

    const disasters = kvData?.value || [];
    console.log(`✅ Retrieved ${disasters.length} active disasters from kv_store`);
    return { disasters };
  } catch (error: any) {
    console.error("❌ Failed to get disasters:", error);
    // Return empty array instead of throwing
    return { disasters: [] };
  }
}

/**
 * Create Disaster Event
 */
export async function createDisasterEvent(eventData: Partial<DisasterEvent>) {
  try {
    const { data, error } = await supabase
      .from("disaster_events")
      .insert({
        disaster_type: eventData.disaster_type,
        title: eventData.title,
        description: eventData.description,
        severity: eventData.severity,
        status: eventData.status || "active",
        affected_areas: eventData.affected_areas,
        location_latitude: eventData.location_latitude,
        location_longitude: eventData.location_longitude,
        casualties_reported: eventData.casualties_reported || 0,
        families_affected: eventData.families_affected || 0,
        evacuation_centers_active: eventData.evacuation_centers_active || 0,
        created_by_department_id: eventData.created_by_department_id,
      })
      .select()
      .single();

    if (error) throw error;

    console.log("✅ Disaster event created successfully:", data.id);
    return { success: true, eventId: data.id, event: data };
  } catch (error: any) {
    console.error("❌ Failed to create disaster event:", error);
    throw new Error(error.message || "Failed to create disaster event");
  }
}

/**
 * Update Disaster Event
 */
export async function updateDisasterEvent(eventId: string, updates: Partial<DisasterEvent>) {
  try {
    const updateData: any = { ...updates };
    
    if (updates.status === "resolved") {
      updateData.resolved_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from("disaster_events")
      .update(updateData)
      .eq("id", eventId)
      .select()
      .single();

    if (error) throw error;

    console.log("✅ Disaster event updated successfully:", eventId);
    return { success: true, event: data };
  } catch (error: any) {
    console.error("❌ Failed to update disaster event:", error);
    throw new Error(error.message || "Failed to update disaster event");
  }
}

/**
 * Subscribe to real-time disaster events
 * NOTE: Real-time only works once proper tables are created
 */
export function subscribeToDisasters(
  callback: (payload: any) => void
): RealtimeChannel {
  console.log("🔴 Attempting to subscribe to real-time disasters...");
  
  try {
    const channel = supabase
      .channel("disasters-channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "disaster_events",
        },
        (payload) => {
          console.log("🔴 Real-time disaster update:", payload);
          callback(payload);
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("✅ Subscribed to disasters channel");
        } else {
          console.log("⚠️ Disasters subscription status:", status);
        }
      });

    return channel;
  } catch (error) {
    console.log("⚠️ Real-time subscription failed (tables not ready), returning mock channel");
    return supabase.channel("disasters-mock");
  }
}

// ============================================
// HOSPITALS
// ============================================

/**
 * Get Hospitals
 * FALLBACK MODE: Uses kv_store until proper tables are created
 */
export async function getHospitals(): Promise<{ hospitals: Hospital[] }> {
  try {
    console.log("📊 Fetching hospitals via kv_store fallback...");
    
    // Try table-based approach first
    try {
      const { data, error } = await supabase
        .from("hospitals")
        .select("*")
        .order("name");

      if (!error && data) {
        console.log(`✅ Retrieved ${data.length} hospitals from table`);
        return { hospitals: data };
      }
    } catch (tableError) {
      console.log("⚠️ Table not available, using kv_store fallback");
    }

    // Fallback: Use kv_store
    const { data: kvData } = await supabase
      .from("kv_store_dd0f68d8")
      .select("value")
      .eq("key", "hospitals_capacity")
      .single();

    const hospitals = kvData?.value || [];
    console.log(`✅ Retrieved ${hospitals.length} hospitals from kv_store`);
    return { hospitals };
  } catch (error: any) {
    console.error("❌ Failed to get hospitals:", error);
    // Return empty array instead of throwing
    return { hospitals: [] };
  }
}

/**
 * Update Hospital Capacity
 * FALLBACK MODE: Uses kv_store until proper tables are created
 */
export async function updateHospitalCapacity(
  hospitalId: string,
  updates: {
    availableBeds?: number;
    emergencyCapacity?: number;
    icuCapacity?: number;
    status?: string;
  }
) {
  try {
    console.log(`📝 Updating hospital ${hospitalId} via kv_store fallback...`);
    
    // Try table-based approach first
    try {
      const { data, error } = await supabase
        .from("hospitals")
        .update({
          available_beds: updates.availableBeds,
          emergency_capacity: updates.emergencyCapacity,
          icu_capacity: updates.icuCapacity,
          status: updates.status,
        })
        .eq("id", hospitalId)
        .select()
        .single();

      if (!error && data) {
        console.log("✅ Hospital capacity updated in table:", hospitalId);
        return { success: true, hospital: data };
      }
    } catch (tableError) {
      console.log("⚠️ Table not available, using kv_store fallback");
    }

    // Fallback: Update in kv_store
    const { data: kvData } = await supabase
      .from("kv_store_dd0f68d8")
      .select("value")
      .eq("key", "hospitals_capacity")
      .single();

    const hospitals = kvData?.value || [];
    const updatedHospitals = hospitals.map((hospital: any) => 
      hospital.id === hospitalId 
        ? { 
            ...hospital, 
            availableBeds: updates.availableBeds ?? hospital.availableBeds,
            emergencyCapacity: updates.emergencyCapacity ?? hospital.emergencyCapacity,
            icuCapacity: updates.icuCapacity ?? hospital.icuCapacity,
            status: updates.status ?? hospital.status,
            updated_at: new Date().toISOString()
          }
        : hospital
    );

    await supabase
      .from("kv_store_dd0f68d8")
      .upsert({
        key: "hospitals_capacity",
        value: updatedHospitals,
        updated_at: new Date().toISOString()
      });

    const updatedHospital = updatedHospitals.find((h: any) => h.id === hospitalId);
    console.log("✅ Hospital capacity updated in kv_store:", hospitalId);
    return { success: true, hospital: updatedHospital };
  } catch (error: any) {
    console.error("❌ Failed to update hospital capacity:", error);
    throw new Error(error.message || "Failed to update hospital capacity");
  }
}

/**
 * Subscribe to real-time hospital updates
 * NOTE: Real-time only works once proper tables are created
 */
export function subscribeToHospitals(
  callback: (payload: any) => void
): RealtimeChannel {
  console.log("🔴 Attempting to subscribe to real-time hospital updates...");
  
  try {
    const channel = supabase
      .channel("hospitals-channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "hospitals",
        },
        (payload) => {
          console.log("🔴 Real-time hospital update:", payload);
          callback(payload);
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("✅ Subscribed to hospitals channel");
        } else {
          console.log("⚠️ Hospitals subscription status:", status);
        }
      });

    return channel;
  } catch (error) {
    console.log("⚠️ Real-time subscription failed (tables not ready), returning mock channel");
    return supabase.channel("hospitals-mock");
  }
}

/**
 * Unsubscribe from a realtime channel
 */
export function unsubscribeChannel(channel: RealtimeChannel): void {
  if (channel) {
    supabase.removeChannel(channel);
    console.log("✅ Unsubscribed from channel");
  }
}

// ============================================
// WEATHER WARNINGS (Department → Citizens)
// ============================================

/**
 * Create Weather Warning (for departments to alert citizens)
 */
export async function createWeatherWarning(warningData: {
  warningType: "typhoon" | "flood" | "earthquake" | "severe_weather";
  title: string;
  description: string;
  severity: "advisory" | "warning" | "critical";
  affectedAreas: string[];
  validUntil?: string;
  issuedByDepartmentId?: string;
  issuedByDepartmentName?: string;
}) {
  try {
    const { data, error } = await supabase
      .from("weather_warnings")
      .insert({
        warning_type: warningData.warningType,
        title: warningData.title,
        description: warningData.description,
        severity: warningData.severity,
        affected_areas: warningData.affectedAreas,
        valid_until: warningData.validUntil,
        issued_by_department_id: warningData.issuedByDepartmentId,
        issued_by_department_name: warningData.issuedByDepartmentName,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;

    console.log("✅ Weather warning created successfully:", data.id);
    return { success: true, warning: data };
  } catch (error: any) {
    console.error("❌ Failed to create weather warning:", error);
    throw new Error(error.message || "Failed to create weather warning");
  }
}

/**
 * Get Active Weather Warnings (for citizens)
 */
export async function getActiveWeatherWarnings(): Promise<{ warnings: WeatherWarning[] }> {
  try {
    const { data, error } = await supabase
      .from("weather_warnings")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) throw error;

    console.log(`✅ Retrieved ${data?.length || 0} active weather warnings`);
    return { warnings: data || [] };
  } catch (error: any) {
    console.error("❌ Failed to get weather warnings:", error);
    throw new Error(error.message || "Failed to get weather warnings");
  }
}

/**
 * Subscribe to real-time weather warnings
 */
export function subscribeToWeatherWarnings(
  callback: (payload: any) => void
): RealtimeChannel {
  console.log("🔴 Subscribing to real-time weather warnings...");
  
  const channel = supabase
    .channel("weather-warnings-channel")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "weather_warnings",
      },
      (payload) => {
        console.log("🔴 Real-time weather warning update:", payload);
        callback(payload);
      }
    )
    .subscribe();

  return channel;
}

// ============================================
// ANALYTICS
// ============================================

/**
 * Get Analytics Summary
 */
export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  try {
    const { data, error } = await supabase
      .from("analytics_summary")
      .select("*")
      .single();

    if (error) throw error;

    console.log("✅ Retrieved analytics summary");
    return data;
  } catch (error: any) {
    console.error("❌ Failed to get analytics:", error);
    throw new Error(error.message || "Failed to get analytics");
  }
}

/**
 * Manually refresh analytics (optional - triggers do this automatically)
 */
export async function refreshAnalytics() {
  try {
    const { error } = await supabase.rpc("refresh_analytics_summary");

    if (error) throw error;

    console.log("✅ Analytics refreshed successfully");
    return { success: true };
  } catch (error: any) {
    console.error("❌ Failed to refresh analytics:", error);
    throw new Error(error.message || "Failed to refresh analytics");
  }
}

/**
 * Subscribe to real-time analytics updates
 */
export function subscribeToAnalytics(
  callback: (payload: any) => void
): RealtimeChannel {
  console.log("🔴 Subscribing to real-time analytics...");
  
  const channel = supabase
    .channel("analytics-channel")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "analytics_summary",
      },
      (payload) => {
        console.log("🔴 Real-time analytics update:", payload);
        callback(payload);
      }
    )
    .subscribe();

  return channel;
}

// ============================================
// CLEANUP
// ============================================

/**
 * Unsubscribe from all channels
 */
export async function unsubscribeAll() {
  await supabase.removeAllChannels();
  console.log("🔴 Unsubscribed from all channels");
}
