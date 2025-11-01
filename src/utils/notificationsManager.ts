/**
 * Notifications Manager
 * Handles notification state, marking as read, etc.
 */

import { saveToStorage, getFromStorage } from './storageUtils';
import { saveUserData, getUserData } from './supabaseClient';

export interface Notification {
  id: string;
  type: 'alert' | 'success' | 'info' | 'warning';
  title: string;
  message: string;
  time: string;
  timestamp: number;
  read: boolean;
}

const NOTIFICATIONS_KEY = 'APP_NOTIFICATIONS';

/**
 * Get all notifications
 */
export async function getNotifications(accessToken?: string): Promise<Notification[]> {
  // Try localStorage first
  const localNotifications = getFromStorage<Notification[]>(NOTIFICATIONS_KEY);
  
  if (localNotifications) {
    return localNotifications;
  }
  
  // Try cloud if authenticated
  if (accessToken) {
    try {
      const cloudNotifications = await getUserData<Notification[]>('notifications', accessToken);
      if (cloudNotifications) {
        saveToStorage(NOTIFICATIONS_KEY, cloudNotifications);
        return cloudNotifications;
      }
    } catch (error) {
      console.error('Failed to load notifications from cloud:', error);
    }
  }
  
  return [];
}

/**
 * Mark a single notification as read
 */
export async function markNotificationAsRead(
  notificationId: string,
  accessToken?: string
): Promise<void> {
  const notifications = await getNotifications(accessToken);
  const updated = notifications.map(n => 
    n.id === notificationId ? { ...n, read: true } : n
  );
  
  saveToStorage(NOTIFICATIONS_KEY, updated);
  
  if (accessToken) {
    try {
      await saveUserData('notifications', updated, accessToken);
    } catch (error) {
      console.error('Failed to sync notification status:', error);
    }
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(accessToken?: string): Promise<void> {
  const notifications = await getNotifications(accessToken);
  const updated = notifications.map(n => ({ ...n, read: true }));
  
  saveToStorage(NOTIFICATIONS_KEY, updated);
  
  if (accessToken) {
    try {
      await saveUserData('notifications', updated, accessToken);
    } catch (error) {
      console.error('Failed to sync notifications:', error);
    }
  }
}

/**
 * Add a new notification
 */
export async function addNotification(
  notification: Omit<Notification, 'id' | 'timestamp' | 'read'>,
  accessToken?: string
): Promise<void> {
  const notifications = await getNotifications(accessToken);
  
  const newNotification: Notification = {
    ...notification,
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    read: false,
  };
  
  const updated = [newNotification, ...notifications].slice(0, 50); // Keep last 50
  
  saveToStorage(NOTIFICATIONS_KEY, updated);
  
  if (accessToken) {
    try {
      await saveUserData('notifications', updated, accessToken);
    } catch (error) {
      console.error('Failed to save notification to cloud:', error);
    }
  }
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(accessToken?: string): Promise<number> {
  const notifications = await getNotifications(accessToken);
  return notifications.filter(n => !n.read).length;
}

/**
 * Clear all notifications
 */
export async function clearAllNotifications(accessToken?: string): Promise<void> {
  saveToStorage(NOTIFICATIONS_KEY, []);
  
  if (accessToken) {
    try {
      await saveUserData('notifications', [], accessToken);
    } catch (error) {
      console.error('Failed to clear notifications from cloud:', error);
    }
  }
}
