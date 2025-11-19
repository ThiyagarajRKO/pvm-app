import { getRecordModel } from '../lib/models/record';
import { getSequelize } from '../lib/db';

async function seedDatabase() {
  try {
    console.log('Connecting to database...');
    const sequelize = await getSequelize();
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    // Sync models
    await sequelize.sync({ force: true }); // This will drop and recreate tables
    console.log('Database synced.');

    const RecordModel = await getRecordModel();

    // Sample data
    const sampleRecords = [
      {
        date: new Date('2024-01-15'),
        name: 'Rajesh Kumar',
        fatherName: 'Suresh Kumar',
        street: 'Main Street',
        place: 'Mumbai',
        weightGrams: 24.5,
        itemType: 'Gold' as const,
        amount: 150000,
        mobile: '9876543210',
        personImageUrl: 'https://example.com/person1.jpg',
        itemImageUrl: 'https://example.com/item1.jpg',
      },
      {
        date: new Date('2024-01-14'),
        name: 'Priya Sharma',
        fatherName: 'Ravi Sharma',
        street: 'Park Avenue',
        place: 'Delhi',
        weightGrams: 15.2,
        itemType: 'Silver' as const,
        amount: 85000,
        mobile: '8765432109',
        personImageUrl: 'https://example.com/person2.jpg',
        itemImageUrl: 'https://example.com/item2.jpg',
      },
      {
        date: new Date('2024-01-13'),
        name: 'Amit Singh',
        fatherName: 'Gurpreet Singh',
        street: 'Ring Road',
        place: 'Bangalore',
        weightGrams: 32.1,
        itemType: 'Gold' as const,
        amount: 200000,
        mobile: '7654321098',
        personImageUrl: 'https://example.com/person3.jpg',
        itemImageUrl: 'https://example.com/item3.jpg',
      },
      {
        date: new Date('2024-01-12'),
        name: 'Kavita Patel',
        fatherName: 'Rajesh Patel',
        street: 'MG Road',
        place: 'Ahmedabad',
        weightGrams: 8.7,
        itemType: 'Silver' as const,
        amount: 45000,
        mobile: '6543210987',
        personImageUrl: 'https://example.com/person4.jpg',
        itemImageUrl: 'https://example.com/item4.jpg',
      },
      {
        date: new Date('2024-01-11'),
        name: 'Vikram Rao',
        fatherName: 'Shankar Rao',
        street: 'Commercial Street',
        place: 'Chennai',
        weightGrams: 18.3,
        itemType: 'Gold' as const,
        amount: 115000,
        mobile: '5432109876',
        personImageUrl: 'https://example.com/person5.jpg',
        itemImageUrl: 'https://example.com/item5.jpg',
      },
    ];

    // Insert sample records
    for (const recordData of sampleRecords) {
      await RecordModel.create(recordData);
    }

    console.log('Sample data seeded successfully!');
    console.log(`Created ${sampleRecords.length} sample records.`);
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    const sequelize = await getSequelize();
    await sequelize.close();
    console.log('Database connection closed.');
  }
}

// Run the seed function
seedDatabase();
