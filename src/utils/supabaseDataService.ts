/**
 * Supabase Data Service
 * Handles all CRUD operations for BantayAlert data
 */

import { supabase } from './supabaseClient';

// ============================================
// EMERGENCY CONTACTS
// ============================================

export interface EmergencyContact {
  id?: string;
  user_id?: string;
  name: string;
  phone_number: string;
  contact_type: string;
  is_primary: boolean;
  created_at?: string;
  updated_at?: string;
}

export async function getEmergencyContacts(userId: string): Promise<EmergencyContact[]> {
  const { data, error } = await supabase
    .from('emergency_contacts')
    .select('*')
    .eq('user_id', userId)
    .order('is_primary', { ascending: false })
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching contacts:', error);
    return [];
  }

  return data || [];
}

export async function addEmergencyContact(userId: string, contact: EmergencyContact) {
  const { data, error } = await supabase
    .from('emergency_contacts')
    .insert([{
      user_id: userId,
      name: contact.name,
      phone_number: contact.phone_number,
      contact_type: contact.contact_type,
      is_primary: contact.is_primary
    }])
    .select()
    .single();

  if (error) {
    console.error('Error adding contact:', error);
    throw error;
  }

  return data;
}

export async function updateEmergencyContact(contactId: string, contact: Partial<EmergencyContact>) {
  const { data, error } = await supabase
    .from('emergency_contacts')
    .update(contact)
    .eq('id', contactId)
    .select()
    .single();

  if (error) {
    console.error('Error updating contact:', error);
    throw error;
  }

  return data;
}

export async function deleteEmergencyContact(contactId: string) {
  const { error } = await supabase
    .from('emergency_contacts')
    .delete()
    .eq('id', contactId);

  if (error) {
    console.error('Error deleting contact:', error);
    throw error;
  }
}

// ============================================
// PREPARATION CHECKLISTS
// ============================================

export interface ChecklistItem {
  id?: string;
  checklist_id?: string;
  user_id?: string;
  item_text: string;
  completed: boolean;
  item_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface Checklist {
  id?: string;
  user_id?: string;
  checklist_type: string;
  name: string;
  progress: number;
  items?: ChecklistItem[];
  created_at?: string;
  updated_at?: string;
}

export async function getChecklists(userId: string): Promise<Checklist[]> {
  const { data: checklists, error: checklistError } = await supabase
    .from('preparation_checklists')
    .select('*')
    .eq('user_id', userId);

  if (checklistError) {
    console.error('Error fetching checklists:', checklistError);
    return [];
  }

  if (!checklists || checklists.length === 0) {
    return [];
  }

  // Fetch items for each checklist
  const checklistsWithItems = await Promise.all(
    checklists.map(async (checklist) => {
      const { data: items } = await supabase
        .from('checklist_items')
        .select('*')
        .eq('checklist_id', checklist.id)
        .order('item_order');

      return {
        ...checklist,
        items: items || []
      };
    })
  );

  return checklistsWithItems;
}

export async function initializeChecklists(userId: string, checklistsData: any) {
  try {
    // Initialize each checklist type
    for (const [type, data] of Object.entries(checklistsData)) {
      const checklistData = data as any;
      
      // Create or get checklist
      const { data: existingChecklist } = await supabase
        .from('preparation_checklists')
        .select('id')
        .eq('user_id', userId)
        .eq('checklist_type', type)
        .single();

      let checklistId: string;

      if (existingChecklist) {
        checklistId = existingChecklist.id;
        
        // Update progress
        await supabase
          .from('preparation_checklists')
          .update({ progress: checklistData.progress, name: checklistData.name })
          .eq('id', checklistId);
      } else {
        // Create new checklist
        const { data: newChecklist } = await supabase
          .from('preparation_checklists')
          .insert([{
            user_id: userId,
            checklist_type: type,
            name: checklistData.name,
            progress: checklistData.progress
          }])
          .select()
          .single();

        checklistId = newChecklist!.id;

        // Add items
        const items = checklistData.items.map((item: any, index: number) => ({
          checklist_id: checklistId,
          user_id: userId,
          item_text: item.text,
          completed: item.completed,
          item_order: index
        }));

        await supabase
          .from('checklist_items')
          .insert(items);
      }
    }

    return true;
  } catch (error) {
    console.error('Error initializing checklists:', error);
    throw error;
  }
}

export async function updateChecklistItem(itemId: string, completed: boolean) {
  const { error } = await supabase
    .from('checklist_items')
    .update({ completed })
    .eq('id', itemId);

  if (error) {
    console.error('Error updating checklist item:', error);
    throw error;
  }

  // Recalculate progress
  const { data: item } = await supabase
    .from('checklist_items')
    .select('checklist_id')
    .eq('id', itemId)
    .single();

  if (item) {
    await recalculateChecklistProgress(item.checklist_id);
  }
}

async function recalculateChecklistProgress(checklistId: string) {
  const { data: items } = await supabase
    .from('checklist_items')
    .select('completed')
    .eq('checklist_id', checklistId);

  if (items && items.length > 0) {
    const completedCount = items.filter(item => item.completed).length;
    const progress = Math.round((completedCount / items.length) * 100);

    await supabase
      .from('preparation_checklists')
      .update({ progress })
      .eq('id', checklistId);
  }
}

// ============================================
// EMERGENCY KIT
// ============================================

export interface KitItem {
  id?: string;
  category_id?: string;
  user_id?: string;
  name: string;
  quantity: string;
  status: 'ready' | 'partial' | 'missing' | 'na';
  priority: 'high' | 'medium' | 'low';
  per_person: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface KitCategory {
  id?: string;
  user_id?: string;
  category_type: string;
  name: string;
  items?: KitItem[];
  created_at?: string;
  updated_at?: string;
}

export async function getEmergencyKit(userId: string): Promise<KitCategory[]> {
  const { data: categories, error: categoryError } = await supabase
    .from('emergency_kit_categories')
    .select('*')
    .eq('user_id', userId);

  if (categoryError) {
    console.error('Error fetching kit categories:', categoryError);
    return [];
  }

  if (!categories || categories.length === 0) {
    return [];
  }

  // Fetch items for each category
  const categoriesWithItems = await Promise.all(
    categories.map(async (category) => {
      const { data: items } = await supabase
        .from('emergency_kit_items')
        .select('*')
        .eq('category_id', category.id);

      return {
        ...category,
        items: items || []
      };
    })
  );

  return categoriesWithItems;
}

export async function initializeEmergencyKit(userId: string, kitData: any) {
  try {
    for (const [type, data] of Object.entries(kitData)) {
      const categoryData = data as any;
      
      // Create or get category
      const { data: existingCategory } = await supabase
        .from('emergency_kit_categories')
        .select('id')
        .eq('user_id', userId)
        .eq('category_type', type)
        .single();

      let categoryId: string;

      if (existingCategory) {
        categoryId = existingCategory.id;
      } else {
        const { data: newCategory } = await supabase
          .from('emergency_kit_categories')
          .insert([{
            user_id: userId,
            category_type: type,
            name: categoryData.name
          }])
          .select()
          .single();

        categoryId = newCategory!.id;

        // Add items
        const items = categoryData.items.map((item: any) => ({
          category_id: categoryId,
          user_id: userId,
          name: item.name,
          quantity: item.quantity,
          status: item.status,
          priority: item.priority,
          per_person: item.perPerson || false
        }));

        await supabase
          .from('emergency_kit_items')
          .insert(items);
      }
    }

    return true;
  } catch (error) {
    console.error('Error initializing emergency kit:', error);
    throw error;
  }
}

export async function addKitItem(userId: string, categoryType: string, item: KitItem) {
  // Get category ID
  const { data: category } = await supabase
    .from('emergency_kit_categories')
    .select('id')
    .eq('user_id', userId)
    .eq('category_type', categoryType)
    .single();

  if (!category) {
    throw new Error('Category not found');
  }

  const { data, error } = await supabase
    .from('emergency_kit_items')
    .insert([{
      category_id: category.id,
      user_id: userId,
      name: item.name,
      quantity: item.quantity,
      status: item.status,
      priority: item.priority,
      per_person: item.per_person
    }])
    .select()
    .single();

  if (error) {
    console.error('Error adding kit item:', error);
    throw error;
  }

  return data;
}

export async function updateKitItem(itemId: string, updates: Partial<KitItem>) {
  const { data, error } = await supabase
    .from('emergency_kit_items')
    .update(updates)
    .eq('id', itemId)
    .select()
    .single();

  if (error) {
    console.error('Error updating kit item:', error);
    throw error;
  }

  return data;
}

// ============================================
// USER SETTINGS
// ============================================

export interface UserSettings {
  id?: string;
  user_id?: string;
  location_city?: string;
  location_latitude?: number;
  location_longitude?: number;
  family_members?: number;
  alert_severe_weather?: boolean;
  alert_earthquakes?: boolean;
  alert_floods?: boolean;
  alert_typhoons?: boolean;
  notification_enabled?: boolean;
  created_at?: string;
  updated_at?: string;
}

export async function getUserSettings(userId: string): Promise<UserSettings | null> {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No settings found, return null
      return null;
    }
    console.error('Error fetching user settings:', error);
    return null;
  }

  return data;
}

export async function saveUserSettings(userId: string, settings: Partial<UserSettings>) {
  const { data: existing } = await supabase
    .from('user_settings')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (existing) {
    // Update existing
    const { data, error } = await supabase
      .from('user_settings')
      .update(settings)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating settings:', error);
      throw error;
    }

    return data;
  } else {
    // Create new
    const { data, error } = await supabase
      .from('user_settings')
      .insert([{
        user_id: userId,
        ...settings
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating settings:', error);
      throw error;
    }

    return data;
  }
}

// ============================================
// COMMUNICATION PLAN
// ============================================

export interface CommunicationPlan {
  id?: string;
  user_id?: string;
  meeting_point_primary?: string;
  meeting_point_secondary?: string;
  out_of_town_contact_name?: string;
  out_of_town_contact_phone?: string;
  additional_notes?: string;
  created_at?: string;
  updated_at?: string;
}

export async function getCommunicationPlan(userId: string): Promise<CommunicationPlan | null> {
  const { data, error } = await supabase
    .from('communication_plans')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching communication plan:', error);
    return null;
  }

  return data;
}

export async function saveCommunicationPlan(userId: string, plan: CommunicationPlan) {
  const { data: existing } = await supabase
    .from('communication_plans')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (existing) {
    const { data, error } = await supabase
      .from('communication_plans')
      .update(plan)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating communication plan:', error);
      throw error;
    }

    return data;
  } else {
    const { data, error } = await supabase
      .from('communication_plans')
      .insert([{
        user_id: userId,
        ...plan
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating communication plan:', error);
      throw error;
    }

    return data;
  }
}

// ============================================
// ACTIVITY LOGS
// ============================================

export interface ActivityLog {
  id?: string;
  user_id?: string;
  activity_type: string;
  activity_description?: string;
  description?: string;
  activity_timestamp?: string;
  created_at?: string;
  metadata?: any;
}

export async function logActivity(userId: string, activity: Omit<ActivityLog, 'id' | 'user_id' | 'activity_timestamp'>) {
  try {
    const { error } = await supabase
      .from('user_activity_log')
      .insert([{
        user_id: userId,
        activity_type: activity.activity_type,
        description: activity.activity_description || activity.description || '',
        metadata: activity.metadata
      }]);

    if (error) {
      console.error('Error logging activity:', error);
    }
  } catch (error) {
    console.error('Error logging activity:', error);
  }
}

export async function getActivityLogs(userId: string, limit = 50): Promise<ActivityLog[]> {
  const { data, error } = await supabase
    .from('user_activity_log')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching activity logs:', error);
    return [];
  }

  return data || [];
}

// ============================================
// WEATHER ALERTS HISTORY
// ============================================

export interface WeatherAlert {
  id?: string;
  user_id?: string;
  alert_type: string;
  alert_title: string;
  alert_description?: string;
  alert_severity: string;
  location?: string;
  alert_timestamp?: string;
  is_read?: boolean;
  metadata?: any;
}

export async function saveWeatherAlert(userId: string, alert: Omit<WeatherAlert, 'id' | 'user_id' | 'alert_timestamp'>) {
  const { error } = await supabase
    .from('weather_alerts_history')
    .insert([{
      user_id: userId,
      ...alert
    }]);

  if (error) {
    console.error('Error saving weather alert:', error);
    throw error;
  }
}

export async function getWeatherAlerts(userId: string, limit = 50): Promise<WeatherAlert[]> {
  const { data, error } = await supabase
    .from('weather_alerts_history')
    .select('*')
    .eq('user_id', userId)
    .order('alert_timestamp', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching weather alerts:', error);
    return [];
  }

  return data || [];
}

export async function markWeatherAlertAsRead(alertId: string) {
  const { error } = await supabase
    .from('weather_alerts_history')
    .update({ is_read: true })
    .eq('id', alertId);

  if (error) {
    console.error('Error marking alert as read:', error);
  }
}

// ============================================
// USER PROFILES
// ============================================

export interface UserProfile {
  id?: string;
  user_id?: string;
  name: string;
  email?: string;
  phone_number?: string;
  city?: string;
  created_at?: string;
  updated_at?: string;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No profile found, return null
      return null;
    }
    console.error('Error fetching user profile:', error);
    return null;
  }

  return data;
}

export async function updateUserProfile(userId: string, profile: Partial<UserProfile>) {
  const { data: existing } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (existing) {
    // Update existing profile
    const { data, error } = await supabase
      .from('user_profiles')
      .update(profile)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }

    return data;
  } else {
    // Create new profile
    const { data, error } = await supabase
      .from('user_profiles')
      .insert([{
        user_id: userId,
        ...profile
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }

    return data;
  }
}

export async function createUserProfile(userId: string, profile: UserProfile) {
  const { data, error } = await supabase
    .from('user_profiles')
    .insert([{
      user_id: userId,
      name: profile.name,
      email: profile.email,
      phone_number: profile.phone_number,
      city: profile.city
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }

  return data;
}

// ============================================
// DATA MIGRATION FROM LOCALSTORAGE
// ============================================

export async function migrateLocalStorageToSupabase(userId: string) {
  try {
    // Migrate contacts
    const contacts = localStorage.getItem('bantayalert_contacts');
    if (contacts) {
      const contactsData = JSON.parse(contacts);
      for (const contact of contactsData) {
        await addEmergencyContact(userId, {
          name: contact.name,
          phone_number: contact.number,
          contact_type: contact.type,
          is_primary: contact.isPrimary
        });
      }
    }

    // Migrate checklists
    const checklists = localStorage.getItem('bantayalert_checklists');
    if (checklists) {
      const checklistsData = JSON.parse(checklists);
      await initializeChecklists(userId, checklistsData);
    }

    // Migrate emergency kit
    const kit = localStorage.getItem('bantayalert_emergency_kit');
    if (kit) {
      const kitData = JSON.parse(kit);
      await initializeEmergencyKit(userId, kitData);
    }

    // Migrate settings
    const location = localStorage.getItem('bantayalert_location');
    const familyMembers = localStorage.getItem('bantayalert_family_members');
    const alertSettings = localStorage.getItem('bantayalert_alert_settings');

    if (location || familyMembers || alertSettings) {
      const settings: Partial<UserSettings> = {};
      
      if (location) {
        settings.location_city = JSON.parse(location);
      }
      
      if (familyMembers) {
        settings.family_members = JSON.parse(familyMembers);
      }
      
      if (alertSettings) {
        const alerts = JSON.parse(alertSettings);
        settings.alert_severe_weather = alerts.severeWeather;
        settings.alert_earthquakes = alerts.earthquakes;
        settings.alert_floods = alerts.floods;
        settings.alert_typhoons = alerts.typhoons;
      }

      await saveUserSettings(userId, settings);
    }

    // Migrate communication plan
    const commPlan = localStorage.getItem('bantayalert_communication_plan');
    if (commPlan) {
      const planData = JSON.parse(commPlan);
      await saveCommunicationPlan(userId, planData);
    }

    return true;
  } catch (error) {
    console.error('Error migrating data:', error);
    return false;
  }
}
