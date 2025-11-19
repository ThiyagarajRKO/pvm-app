import { getRecordModel } from '../lib/models/record';
import { getSequelize } from '../lib/db';

async function syncDatabase() {
  try {
    console.log('Connecting to database...');
    const sequelize = getSequelize();
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    // Initialize the model
    getRecordModel();

    console.log('Syncing database schema...');
    await sequelize.sync({ alter: true }); // This will create/update tables without dropping data
    console.log('Database schema synced successfully.');

    console.log('Database is ready for use!');
  } catch (error) {
    console.error('Error syncing database:', error);
    process.exit(1);
  } finally {
    const sequelize = getSequelize();
    await sequelize.close();
    console.log('Database connection closed.');
  }
}

// Run the sync function
syncDatabase();
