// Initialize database connection on app start
import { getSequelize } from './db';

// Export a function to initialize the database connection
export async function initializeDatabase() {
  await getSequelize();
}

// Trigger database connection (commented out to avoid issues during build)
// initializeDatabase();
