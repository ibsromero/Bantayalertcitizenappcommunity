/**
 * Settings Management Utilities
 * Handles all user preferences including dark mode, language, notifications
 */

import { saveToStorage, getFromStorage } from './storageUtils';
import { saveUserData, getUserData } from './supabaseClient';
import type { Language } from './translations';

export interface UserSettings {
  language: Language;
  darkMode: boolean;
  notificationsEnabled: boolean;
  weatherAlertsEnabled: boolean;
  emergencyAlertsEnabled: boolean;
  autoBackup: boolean;
  locationPermission: boolean;
}

const DEFAULT_SETTINGS: UserSettings = {
  language: 'en',
  darkMode: false,
  notificationsEnabled: true,
  weatherAlertsEnabled: true,
  emergencyAlertsEnabled: true,
  autoBackup: true,
  locationPermission: false,
};

const SETTINGS_KEY = 'USER_SETTINGS';

/**
 * Get user settings from localStorage or cloud
 */
export async function getSettings(accessToken?: string): Promise<UserSettings> {
  // Try to get from localStorage first
  const localSettings = getFromStorage<UserSettings>(SETTINGS_KEY);
  
  if (localSettings) {
    return { ...DEFAULT_SETTINGS, ...localSettings };
  }
  
  // If user is authenticated, try to get from cloud
  if (accessToken) {
    try {
      const cloudSettings = await getUserData<UserSettings>('settings', accessToken);
      if (cloudSettings) {
        // Save to localStorage for offline access
        saveToStorage(SETTINGS_KEY, cloudSettings);
        return { ...DEFAULT_SETTINGS, ...cloudSettings };
      }
    } catch (error) {
      console.error('Failed to load settings from cloud:', error);
    }
  }
  
  return DEFAULT_SETTINGS;
}

/**
 * Save user settings to localStorage and cloud
 */
export async function saveSettings(
  settings: Partial<UserSettings>,
  accessToken?: string
): Promise<void> {
  // Get current settings
  const currentSettings = await getSettings(accessToken);
  const newSettings = { ...currentSettings, ...settings };
  
  // Save to localStorage
  saveToStorage(SETTINGS_KEY, newSettings);
  
  // Save to cloud if authenticated
  if (accessToken) {
    try {
      await saveUserData('settings', newSettings, accessToken);
    } catch (error) {
      console.error('Failed to save settings to cloud:', error);
    }
  }
  
  // Apply settings immediately
  applySettings(newSettings);
}

/**
 * Apply settings to the application
 */
export function applySettings(settings: UserSettings): void {
  // Apply dark mode
  if (settings.darkMode) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  
  // Apply language
  document.documentElement.lang = settings.language;
  
  // Store in localStorage for immediate access
  saveToStorage(SETTINGS_KEY, settings);
}

/**
 * Toggle dark mode
 */
export async function toggleDarkMode(accessToken?: string): Promise<boolean> {
  const settings = await getSettings(accessToken);
  const newDarkMode = !settings.darkMode;
  
  await saveSettings({ darkMode: newDarkMode }, accessToken);
  
  return newDarkMode;
}

/**
 * Change language
 */
export async function changeLanguage(
  language: Language,
  accessToken?: string
): Promise<void> {
  await saveSettings({ language }, accessToken);
}

/**
 * Toggle notifications
 */
export async function toggleNotifications(
  enabled: boolean,
  accessToken?: string
): Promise<void> {
  await saveSettings({ notificationsEnabled: enabled }, accessToken);
}

/**
 * Initialize settings on app load
 */
export async function initializeSettings(accessToken?: string): Promise<UserSettings> {
  const settings = await getSettings(accessToken);
  applySettings(settings);
  return settings;
}
