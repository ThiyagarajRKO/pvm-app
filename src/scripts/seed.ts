import { getSequelize } from '../lib/db';

async function seedDatabase() {
  try {
    console.log('Connecting to database...');
    const sequelize = await getSequelize();
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    console.log('Database connection test completed successfully!');
  } catch (error) {
    console.error('Error connecting to database:', error);
  } finally {
    const sequelize = await getSequelize();
    await sequelize.close();
    console.log('Database connection closed.');
  }
}

// Run the seed function
seedDatabase();
