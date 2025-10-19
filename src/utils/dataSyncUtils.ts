/**
 * Data Synchronization Utilities
 * Handles migration from localStorage to Supabase and ongoing sync
 */

import { supabase } from './supabaseClient';
import { 
  migrateLocalStorageToSupabase,
  getEmergencyContacts,
  getChecklists,
  getEmergencyKit,
  getUserSettings,
  getCommunicationPlan,
  initializeChecklists,
  initializeEmergencyKit
} from './supabaseDataService';
import { 
  isMigrationDone, 
  markMigrationDone, 
  saveToStorage,
  getFromStorage 
} from './storageUtils';
import { toast } from 'sonner@2.0.3';

/**
 * Initialize user data on first login
 * Migrates localStorage data if available, or creates default data
 */
export async function initializeUserData(userId: string): Promise<void> {
  try {
    // Check if migration already done
    if (isMigrationDone()) {
      console.log('Migration already completed, syncing data...');
      await syncDataFromSupabase(userId);
      return;
    }

    console.log('Starting data migration...');

    // Check if user has any data in Supabase
    const existingContacts = await getEmergencyContacts(userId);
    
    if (existingContacts.length === 0) {
      // No data in Supabase - check localStorage
      const localContacts = getFromStorage('CONTACTS');
      
      if (localContacts) {
        // Migrate from localStorage
        console.log('Migrating data from localStorage to Supabase...');
        const success = await migrateLocalStorageToSupabase(userId);
        
        if (success) {
          markMigrationDone();
          toast.success('Your data has been migrated to the cloud!');
          console.log('Migration completed successfully');
        } else {
          toast.error('Some data failed to migrate. Please check your data.');
          console.error('Migration had errors');
        }
      } else {
        // No localStorage data - initialize with defaults
        console.log('Initializing default data...');
        await initializeDefaultData(userId);
        markMigrationDone();
        toast.success('Welcome! Your emergency preparedness profile has been created.');
      }
    } else {
      // Data exists in Supabase - just sync
      console.log('Existing data found in Supabase, syncing...');
      await syncDataFromSupabase(userId);
      markMigrationDone();
    }
  } catch (error) {
    console.error('Error initializing user data:', error);
    toast.error('Failed to initialize your data. Please try again.');
  }
}

/**
 * Initialize default data for new users
 */
async function initializeDefaultData(userId: string): Promise<void> {
  try {
    // Initialize default checklists
    const defaultChecklists = {
      earthquake: {
        name: "Earthquake",
        progress: 0,
        items: [
          { id: 1, text: "Secure heavy furniture and appliances", completed: false },
          { id: 2, text: "Identify safe spots in each room", completed: false },
          { id: 3, text: "Practice drop, cover, and hold on", completed: false },
          { id: 4, text: "Prepare emergency shut-off procedures", completed: false },
          { id: 5, text: "Create family communication plan", completed: false },
          { id: 6, text: "Store emergency supplies in accessible location", completed: false },
        ]
      },
      flood: {
        name: "Flood",
        progress: 0,
        items: [
          { id: 1, text: "Know your evacuation routes", completed: false },
          { id: 2, text: "Prepare sandbags and barriers", completed: false },
          { id: 3, text: "Move important items to higher floors", completed: false },
          { id: 4, text: "Review flood insurance policy", completed: false },
          { id: 5, text: "Install sump pump backup power", completed: false },
          { id: 6, text: "Prepare waterproof document storage", completed: false },
        ]
      },
      typhoon: {
        name: "Typhoon",
        progress: 0,
        items: [
          { id: 1, text: "Trim trees and secure outdoor items", completed: false },
          { id: 2, text: "Install storm shutters or plywood", completed: false },
          { id: 3, text: "Stock up on emergency supplies", completed: false },
          { id: 4, text: "Review emergency evacuation plan", completed: false },
          { id: 5, text: "Charge all electronic devices", completed: false },
          { id: 6, text: "Fill bathtub with water", completed: false },
        ]
      }
    };

    await initializeChecklists(userId, defaultChecklists);

    // Initialize default emergency kit
    const defaultKit = {
      food: {
        name: "Food & Water",
        items: [
          { name: "Water (1 gallon per person per day)", quantity: "3", status: "missing", priority: "high", perPerson: true },
          { name: "Non-perishable food (3-day supply)", quantity: "0", status: "missing", priority: "high", perPerson: true },
          { name: "Can opener", quantity: "0", status: "missing", priority: "medium", perPerson: false },
          { name: "Emergency food bars", quantity: "0", status: "missing", priority: "medium", perPerson: true },
        ]
      },
      tools: {
        name: "Tools & Equipment",
        items: [
          { name: "Flashlight with extra batteries", quantity: "0", status: "missing", priority: "high", perPerson: false },
          { name: "Battery-powered radio", quantity: "0", status: "missing", priority: "high", perPerson: false },
          { name: "Whistle", quantity: "0", status: "missing", priority: "medium", perPerson: true },
          { name: "Multi-tool or knife", quantity: "0", status: "missing", priority: "medium", perPerson: false },
          { name: "Duct tape and plastic sheeting", quantity: "0", status: "missing", priority: "low", perPerson: false },
        ]
      },
      safety: {
        name: "Safety & Medical",
        items: [
          { name: "First aid kit", quantity: "0", status: "missing", priority: "high", perPerson: false },
          { name: "Prescription medications", quantity: "0", status: "missing", priority: "high", perPerson: true },
          { name: "Face masks", quantity: "0", status: "missing", priority: "medium", perPerson: true },
          { name: "Hand sanitizer", quantity: "0", status: "missing", priority: "medium", perPerson: false },
          { name: "Emergency blanket", quantity: "0", status: "missing", priority: "medium", perPerson: true },
        ]
      }
    };

    await initializeEmergencyKit(userId, defaultKit);

    console.log('Default data initialized successfully');
  } catch (error) {
    console.error('Error initializing default data:', error);
    throw error;
  }
}

/**
 * Sync all data from Supabase to local state
 */
export async function syncDataFromSupabase(userId: string): Promise<void> {
  try {
    // Sync contacts
    const contacts = await getEmergencyContacts(userId);
    if (contacts.length > 0) {
      const formattedContacts = contacts.map(c => ({
        id: c.id,
        name: c.name,
        number: c.phone_number,
        type: c.contact_type,
        isPrimary: c.is_primary
      }));
      saveToStorage('CONTACTS', formattedContacts);
    }

    // Sync checklists
    const checklists = await getChecklists(userId);
    if (checklists.length > 0) {
      const formattedChecklists: any = {};
      
      for (const checklist of checklists) {
        formattedChecklists[checklist.checklist_type] = {
          name: checklist.name,
          progress: checklist.progress,
          items: (checklist.items || []).map((item, index) => ({
            id: index + 1,
            text: item.item_text,
            completed: item.completed
          }))
        };
      }
      
      if (Object.keys(formattedChecklists).length > 0) {
        saveToStorage('CHECKLISTS', formattedChecklists);
      }
    }

    // Sync emergency kit
    const kit = await getEmergencyKit(userId);
    if (kit.length > 0) {
      const formattedKit: any = {};
      
      for (const category of kit) {
        formattedKit[category.category_type] = {
          name: category.name,
          items: (category.items || []).map(item => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            status: item.status,
            priority: item.priority,
            perPerson: item.per_person
          }))
        };
      }
      
      if (Object.keys(formattedKit).length > 0) {
        saveToStorage('EMERGENCY_KIT', formattedKit);
      }
    }

    // Sync settings
    const settings = await getUserSettings(userId);
    if (settings) {
      if (settings.location_city) {
        saveToStorage('LOCATION', settings.location_city);
      }
      if (settings.family_members) {
        saveToStorage('FAMILY_MEMBERS', settings.family_members);
      }
      if (settings.alert_severe_weather !== undefined) {
        saveToStorage('ALERT_SETTINGS', {
          severeWeather: settings.alert_severe_weather,
          earthquakes: settings.alert_earthquakes,
          floods: settings.alert_floods,
          typhoons: settings.alert_typhoons
        });
      }
    }

    // Sync communication plan
    const commPlan = await getCommunicationPlan(userId);
    if (commPlan) {
      saveToStorage('COMMUNICATION_PLAN', {
        meetingPointPrimary: commPlan.meeting_point_primary,
        meetingPointSecondary: commPlan.meeting_point_secondary,
        outOfTownContact: {
          name: commPlan.out_of_town_contact_name,
          phone: commPlan.out_of_town_contact_phone
        },
        notes: commPlan.additional_notes
      });
    }

    console.log('Data synced from Supabase successfully');
  } catch (error) {
    console.error('Error syncing data from Supabase:', error);
  }
}

/**
 * Check and perform auto-sync on app load
 */
export async function autoSync(): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      await syncDataFromSupabase(user.id);
    }
  } catch (error) {
    console.error('Auto-sync failed:', error);
  }
}

/**
 * Force a full sync - useful for debugging or manual refresh
 */
export async function forceSync(accessToken?: string): Promise<boolean> {
  try {
    const { data: { user } } = accessToken 
      ? await supabase.auth.getUser(accessToken)
      : await supabase.auth.getUser();
    
    if (!user) {
      toast.error('Please log in to sync your data');
      return false;
    }

    toast.loading('Syncing your data...');
    
    await syncDataFromSupabase(user.id);
    
    toast.success('Data synced successfully!');
    return true;
  } catch (error) {
    console.error('Force sync failed:', error);
    toast.error('Failed to sync data. Please try again.');
    return false;
  }
}
