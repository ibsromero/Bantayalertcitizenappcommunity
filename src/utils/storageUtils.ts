/**
 * Local Storage Utilities for BantayAlert
 * Provides data persistence with Supabase integration
 * Falls back to localStorage for offline support
 */

const STORAGE_KEYS = {
  USER: 'bantayalert_user',
  CONTACTS: 'bantayalert_contacts',
  CHECKLISTS: 'bantayalert_checklists',
  KIT_ITEMS: 'bantayalert_kit_items',
  EMERGENCY_KIT: 'bantayalert_emergency_kit',
  FAMILY_MEMBERS: 'bantayalert_family_members',
  LOCATION: 'bantayalert_location',
  LOCATION_COORDS: 'bantayalert_location_coords',
  ALERT_SETTINGS: 'bantayalert_alert_settings',
  COMMUNICATION_PLAN: 'bantayalert_communication_plan',
  ACTIVITIES: 'bantayalert_activities',
  MIGRATION_DONE: 'bantayalert_migration_done',
} as const;

/**
 * Save data to localStorage
 * This is used as a fallback and cache for offline support
 */
export function saveToStorage<T>(key: keyof typeof STORAGE_KEYS, data: T): void {
  try {
    const storageKey = STORAGE_KEYS[key];
    localStorage.setItem(storageKey, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to storage:', error);
    // Handle QuotaExceededError or other localStorage errors
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      console.warn('localStorage quota exceeded. Consider clearing old data.');
    }
  }
}

/**
 * Get data from localStorage
 */
export function getFromStorage<T>(key: keyof typeof STORAGE_KEYS): T | null {
  try {
    const storageKey = STORAGE_KEYS[key];
    const data = localStorage.getItem(storageKey);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error reading from storage:', error);
    return null;
  }
}

/**
 * Remove data from localStorage
 */
export function removeFromStorage(key: keyof typeof STORAGE_KEYS): void {
  try {
    const storageKey = STORAGE_KEYS[key];
    localStorage.removeItem(storageKey);
  } catch (error) {
    console.error('Error removing from storage:', error);
  }
}

/**
 * Clear all BantayAlert data from storage
 */
export function clearAllStorage(): void {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Error clearing storage:', error);
  }
}

/**
 * Check if storage is available
 */
export function isStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Check if migration to Supabase has been completed
 */
export function isMigrationDone(): boolean {
  return localStorage.getItem(STORAGE_KEYS.MIGRATION_DONE) === 'true';
}

/**
 * Mark migration as complete
 */
export function markMigrationDone(): void {
  localStorage.setItem(STORAGE_KEYS.MIGRATION_DONE, 'true');
}

/**
 * Reset migration flag (for testing)
 */
export function resetMigrationFlag(): void {
  localStorage.removeItem(STORAGE_KEYS.MIGRATION_DONE);
}
