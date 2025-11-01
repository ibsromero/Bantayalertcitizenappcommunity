/**
 * Translations for BantayAlert - English and Tagalog
 */

export type Language = 'en' | 'tl';

export const translations = {
  en: {
    // Common
    cancel: 'Cancel',
    save: 'Save',
    close: 'Close',
    edit: 'Edit',
    delete: 'Delete',
    add: 'Add',
    update: 'Update',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    
    // Header
    appName: 'BantayAlert',
    appTagline: 'Your Emergency Preparedness Companion',
    
    // Navigation
    dashboard: 'Dashboard',
    contacts: 'Emergency Contacts',
    checklist: 'Preparation Checklist',
    kit: 'Emergency Kit',
    weather: 'Weather Alerts',
    evacuation: 'Evacuation Routes',
    resources: 'Emergency Resources',
    
    // Dashboard
    welcomeBack: 'Welcome back',
    preparednessScore: 'Preparedness Score',
    recentActivity: 'Recent Activity',
    quickActions: 'Quick Actions',
    
    // Emergency Contacts
    emergencyContacts: 'Emergency Contacts',
    addContact: 'Add Contact',
    editContact: 'Edit Contact',
    deleteContact: 'Delete Contact',
    name: 'Name',
    relationship: 'Relationship',
    phoneNumber: 'Phone Number',
    email: 'Email',
    
    // Weather Alerts
    weatherAlerts: 'Weather Alerts',
    currentWeather: 'Current Weather',
    enableAlerts: 'Enable Alerts',
    detectLocation: 'Detect Location',
    location: 'Location',
    
    // Evacuation Routes
    evacuationRoutes: 'Evacuation Routes',
    nearestCenters: 'Nearest Evacuation Centers',
    getDirections: 'Get Directions',
    callCenter: 'Call Center',
    
    // SOS
    sendSOS: 'Send SOS Alert',
    sosAlert: 'Emergency SOS Alert',
    describeEmergency: 'Describe your emergency',
    
    // Settings
    settings: 'Settings',
    account: 'Account',
    notifications: 'Notifications',
    appearance: 'Appearance',
    language: 'Language',
    darkMode: 'Dark Mode',
    syncNow: 'Sync Now',
    signOut: 'Sign Out',
    
    // Notifications
    markAllAsRead: 'Mark all as read',
    noNotifications: 'No notifications',
    
    // Toast Messages
    locationDetected: 'Location detected',
    locationFailed: 'Location detection failed',
    settingsSaved: 'Settings saved',
    syncCompleted: 'Sync completed',
    notificationsEnabled: 'Notifications enabled',
    sosAlertSent: 'SOS Alert Sent!',
  },
  tl: {
    // Common
    cancel: 'Kanselahin',
    save: 'I-save',
    close: 'Isara',
    edit: 'I-edit',
    delete: 'Tanggalin',
    add: 'Magdagdag',
    update: 'I-update',
    loading: 'Naglo-load...',
    error: 'May Mali',
    success: 'Matagumpay',
    
    // Header
    appName: 'BantayAlert',
    appTagline: 'Ang Iyong Kasama sa Emergency Preparedness',
    
    // Navigation
    dashboard: 'Dashboard',
    contacts: 'Emergency Contacts',
    checklist: 'Listahan ng Paghahanda',
    kit: 'Emergency Kit',
    weather: 'Abiso sa Panahon',
    evacuation: 'Mga Ruta ng Evacuationon',
    resources: 'Mga Mapagkukunan',
    
    // Dashboard
    welcomeBack: 'Maligayang pagbabalik',
    preparednessScore: 'Marka sa Paghahanda',
    recentActivity: 'Kamakailang Aktibidad',
    quickActions: 'Mabilisang Aksyon',
    
    // Emergency Contacts
    emergencyContacts: 'Emergency Contacts',
    addContact: 'Magdagdag ng Contact',
    editContact: 'I-edit ang Contact',
    deleteContact: 'Tanggalin ang Contact',
    name: 'Pangalan',
    relationship: 'Relasyon',
    phoneNumber: 'Numero ng Telepono',
    email: 'Email',
    
    // Weather Alerts
    weatherAlerts: 'Abiso sa Panahon',
    currentWeather: 'Kasalukuyang Panahon',
    enableAlerts: 'Paganahin ang mga Abiso',
    detectLocation: 'Tukuyin ang Lokasyon',
    location: 'Lokasyon',
    
    // Evacuation Routes
    evacuationRoutes: 'Mga Ruta ng Evacuation',
    nearestCenters: 'Pinakamalapit na Evacuation Centers',
    getDirections: 'Kunin ang Direksyon',
    callCenter: 'Tawagan ang Center',
    
    // SOS
    sendSOS: 'Magpadala ng SOS Alert',
    sosAlert: 'Emergency SOS Alert',
    describeEmergency: 'Ilarawan ang iyong emergency',
    
    // Settings
    settings: 'Mga Setting',
    account: 'Account',
    notifications: 'Mga Notification',
    appearance: 'Hitsura',
    language: 'Wika',
    darkMode: 'Dark Mode',
    syncNow: 'Mag-sync Ngayon',
    signOut: 'Mag-sign Out',
    
    // Notifications
    markAllAsRead: 'Markahan lahat bilang nabasa',
    noNotifications: 'Walang mga notification',
    
    // Toast Messages
    locationDetected: 'Natukoy ang lokasyon',
    locationFailed: 'Hindi natukoy ang lokasyon',
    settingsSaved: 'Na-save ang mga setting',
    syncCompleted: 'Nakumpleto ang pag-sync',
    notificationsEnabled: 'Pinagana ang mga notification',
    sosAlertSent: 'Naipadala ang SOS Alert!',
  },
};

export function getTranslation(key: string, lang: Language = 'en'): string {
  const keys = key.split('.');
  let value: any = translations[lang];
  
  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) {
      // Fallback to English if translation not found
      value = translations.en;
      for (const k2 of keys) {
        value = value?.[k2];
      }
      break;
    }
  }
  
  return value || key;
}

export function useTranslation(lang: Language = 'en') {
  return {
    t: (key: string) => getTranslation(key, lang),
    language: lang,
  };
}
