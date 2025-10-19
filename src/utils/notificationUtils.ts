/**
 * Browser Notification Utilities for BantayAlert
 * Handles push notifications for weather alerts and emergencies
 */

/**
 * Request notification permission from user
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

/**
 * Send a browser notification
 */
export function sendNotification(title: string, options?: NotificationOptions): void {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return;
  }

  if (Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options,
    });
  } else {
    console.warn('Notification permission not granted');
  }
}

/**
 * Send weather alert notification
 */
export function sendWeatherAlert(alertType: string, description: string, severity: 'low' | 'medium' | 'high'): void {
  const urgencyMap = {
    low: 'Low',
    medium: 'Moderate',
    high: 'High',
  };

  sendNotification('⚠️ Weather Alert', {
    body: `${urgencyMap[severity]} Severity: ${alertType}\n${description}`,
    tag: 'weather-alert',
    requireInteraction: severity === 'high',
    vibrate: severity === 'high' ? [200, 100, 200] : undefined,
  });
}

/**
 * Send emergency notification
 */
export function sendEmergencyNotification(title: string, message: string): void {
  sendNotification(`🚨 ${title}`, {
    body: message,
    tag: 'emergency',
    requireInteraction: true,
    vibrate: [200, 100, 200, 100, 200],
  });
}

/**
 * Check if notifications are supported and enabled
 */
export function areNotificationsEnabled(): boolean {
  return 'Notification' in window && Notification.permission === 'granted';
}

/**
 * Get notification permission status
 */
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}
