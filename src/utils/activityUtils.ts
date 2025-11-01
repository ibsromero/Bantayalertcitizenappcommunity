/**
 * Activity tracking utilities for BantayAlert
 * Logs user actions directly to Supabase
 */

import { logActivity as logActivityToSupabase, getActivityLogs } from "./supabaseDataService";
import { supabase } from "./supabaseClient";
import { saveToStorage, getFromStorage } from "./storageUtils";

export interface Activity {
  id: string;
  type: string;
  description: string;
  timestamp: number;
  icon?: string;
  color?: string;
}

/**
 * Log a new activity
 */
export async function logActivity(
  type: string,
  description: string,
  accessToken?: string
): Promise<void> {
  try {
    // Get current user ID
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Save directly to Supabase
      await logActivityToSupabase(user.id, {
        activity_type: type,
        activity_description: description,
        metadata: { color: getActivityColor(type) }
      });
    } else {
      // Fallback to localStorage if not logged in
      const activity: Activity = {
        id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        description,
        timestamp: Date.now(),
        color: getActivityColor(type),
      };

      const activities = getActivities();
      const updatedActivities = [activity, ...(Array.isArray(activities) ? activities : [])].slice(0, 20);
      saveToStorage("ACTIVITIES", updatedActivities);
    }
  } catch (error) {
    console.error("Error logging activity:", error);
    
    // Final fallback to localStorage
    const activity: Activity = {
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      description,
      timestamp: Date.now(),
      color: getActivityColor(type),
    };
    
    const activities = getActivities();
    const updatedActivities = [activity, ...(Array.isArray(activities) ? activities : [])].slice(0, 20);
    saveToStorage("ACTIVITIES", updatedActivities);
  }
}

/**
 * Get all activities from Supabase or storage
 */
export async function getActivities(): Promise<Activity[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Get from Supabase
      const logs = await getActivityLogs(user.id, 50);
      
      // Convert to Activity format
      return logs.map(log => ({
        id: log.id || '',
        type: log.activity_type,
        description: log.activity_description,
        timestamp: log.activity_timestamp ? new Date(log.activity_timestamp).getTime() : Date.now(),
        color: log.metadata?.color || getActivityColor(log.activity_type)
      }));
    } else {
      // Fallback to localStorage
      const activities = getFromStorage<Activity[]>("ACTIVITIES");
      if (Array.isArray(activities)) {
        return activities;
      }
      return [];
    }
  } catch (error) {
    console.error("Error getting activities:", error);
    
    // Final fallback
    const activities = getFromStorage<Activity[]>("ACTIVITIES");
    if (Array.isArray(activities)) {
      return activities;
    }
    return [];
  }
}

/**
 * Load activities from Supabase
 */
export async function loadActivitiesFromCloud(accessToken: string): Promise<Activity[]> {
  return getActivities();
}

/**
 * Get color for activity type
 */
function getActivityColor(type: string): string {
  const colorMap: { [key: string]: string } = {
    contact_added: "green",
    contact_edited: "blue",
    contact_called: "green",
    checklist_updated: "purple",
    checklist_completed: "green",
    kit_item_added: "green",
    kit_item_updated: "blue",
    kit_tested: "orange",
    location_updated: "blue",
    alert_enabled: "orange",
    profile_updated: "purple",
    evacuation_viewed: "blue",
    resource_downloaded: "green",
    sos_sent: "red",
  };
  
  return colorMap[type] || "gray";
}

/**
 * Get relative time string
 */
export function getRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (seconds < 60) return "Just now";
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
  
  return new Date(timestamp).toLocaleDateString();
}
