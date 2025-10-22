import { projectId, publicAnonKey } from "./supabase/info";

let isInitialized = false;

export async function initializeDepartmentData() {
  // Only initialize once per session
  if (isInitialized) {
    console.log("Department data already initialized, skipping...");
    return;
  }

  console.log("Initializing department sample data...");
  
  try {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-dd0f68d8/init-sample-data`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${publicAnonKey}`,
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      isInitialized = true;
      console.log("✓ Department sample data initialized successfully:", data);
    } else {
      const error = await response.json();
      console.error("✗ Failed to initialize department data:", error);
    }
  } catch (error) {
    console.error("✗ Failed to initialize department data (network error):", error);
  }
}
