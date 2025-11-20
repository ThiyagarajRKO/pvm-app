import { getSequelize } from '../lib/db';
import { getRecordModel } from '../lib/models/record';

async function seedDatabase() {
  try {
    console.log('Connecting to database...');
    const sequelize = await getSequelize();
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    // Seed some sample records
    console.log('Seeding sample records...');
    const RecordModel = await getRecordModel();

    const sampleRecords = [
      {
        slNo: 'SL001',
        date: new Date('2024-01-15'),
        name: 'John Doe',
        fatherName: 'Robert Doe',
        street: 'Main Street',
        place: 'Mumbai',
        weightGrams: 25.5,
        itemType: 'Gold',
        itemCategory: 'active',
        amount: 150000,
        mobile: '9876543210',
      },
      {
        slNo: 'SL002',
        date: new Date('2024-01-16'),
        name: 'Jane Smith',
        fatherName: 'Michael Smith',
        street: 'Park Avenue',
        place: 'Delhi',
        weightGrams: 15.2,
        itemType: 'Silver',
        itemCategory: 'active',
        amount: 80000,
        mobile: '9876543211',
      },
      {
        slNo: 'SL003',
        date: new Date('2024-01-17'),
        name: 'Bob Johnson',
        fatherName: 'David Johnson',
        street: 'Broadway',
        place: 'Bangalore',
        weightGrams: 50.0,
        itemType: 'Gold',
        itemCategory: 'big',
        amount: 300000,
        mobile: '9876543212',
      },
    ];

    for (const recordData of sampleRecords) {
      try {
        await RecordModel.create(recordData as any);
        console.log(`Created record: ${recordData.slNo} - ${recordData.name}`);
      } catch (error) {
        console.log(
          `Record ${recordData.slNo} may already exist:`,
          error.message
        );
      }
    }

    console.log('Sample records seeded successfully!');
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
