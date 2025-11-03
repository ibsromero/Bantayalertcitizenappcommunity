import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { projectId, publicAnonKey } from "./supabase/info";

// Create Supabase client singleton
export const supabase = createSupabaseClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

// API base URL
export const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-dd0f68d8`;

/**
 * Sign up a new user
 */
export async function signUp(email: string, password: string, name: string) {
  try {
    // Use Supabase's built-in auth signup
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
        },
      },
    });

    if (error) throw error;

    // If signup successful, create user profile
    if (data.user) {
      try {
        await supabase.from('user_profiles').insert([{
          user_id: data.user.id,
          email: email,
          name: name,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }]);
      } catch (profileError) {
        console.error('Error creating user profile:', profileError);
        // Don't fail signup if profile creation fails
      }
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Sign in existing user
 */
export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Sign out current user
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

/**
 * Get current session
 */
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  return { data: data.session, error };
}

/**
 * Save user data to backend
 */
export async function saveUserData(dataType: string, data: any, accessToken: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/user/data`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ dataType, data }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to save data");
    }

    return { success: true, error: null };
  } catch (error) {
    return { success: false, error };
  }
}

/**
 * Get user data from backend
 */
export async function getUserData(dataType: string, accessToken: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/user/data/${dataType}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to fetch data");
    }

    return { data: result.data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Reset password for user
 */
export async function resetPassword(email: string) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password',
    });

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    return { success: false, error };
  }
}

/**
 * Update user password
 */
export async function updatePassword(newPassword: string) {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    return { success: false, error };
  }
}

/**
 * Get weather data for a location
 */
export async function getWeatherData(location: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/weather/${encodeURIComponent(location)}`, {
      headers: {
        Authorization: `Bearer ${publicAnonKey}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to fetch weather");
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}
