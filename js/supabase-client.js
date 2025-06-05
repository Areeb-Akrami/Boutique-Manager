// Initialize Supabase client
// These are your actual Supabase credentials for production
const SUPABASE_URL = "https://fhyhygpuvfxsmlvfxwrb.supabase.co"; // Your Supabase project URL
const SUPABASE_KEY= "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoeWh5Z3B1dmZ4c21sdmZ4d3JiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwNTc4ODIsImV4cCI6MjA2MDYzMzg4Mn0.NaZ5l-2niT_4mt6SEX9AIuozmCk_Z5z0LcaT2Z6g2mY"; // Your Supabase anon key

// Global supabase instance
let supabase;

// Initialize the client
function initializeSupabase() {
  try {
    if (typeof supabase !== "undefined") {
      console.log("Supabase client already initialized");
      return supabase;
    }

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      throw new Error("Supabase credentials are missing");
    }

    if (typeof window.supabase !== "undefined") {
      console.log("Using Supabase client");
      supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
      console.log("Supabase client initialized with credentials");
    } else {
      throw new Error("Supabase JS library not loaded");
    }

    return supabase;
  } catch (error) {
    console.error("Error initializing Supabase client:", error);
    alert("Failed to connect to database. Please check your internet connection and refresh the page.");
    throw error;
  }
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  initializeSupabase();
});
