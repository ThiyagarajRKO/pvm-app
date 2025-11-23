/**
 * One-time script to migrate existing weightGrams data to separate goldWeightGrams and silverWeightGrams fields
 *
 * This script should be run after adding the goldWeightGrams and silverWeightGrams columns to the database.
 * It copies the existing weightGrams values to the appropriate new fields based on itemType:
 * - Gold items: weightGrams → goldWeightGrams
 * - Silver items: weightGrams → silverWeightGrams
 * - Both items: weightGrams → both goldWeightGrams and silverWeightGrams
 *
 * Usage: npm run migrate:weight-data
 * Note: This is a one-time operation and should only be run once.
 */

const { Sequelize } = require('sequelize');
const config = require('../database/config');

async function migrateWeightData() {
  const sequelize = new Sequelize(config.development);

  try {
    console.log('Starting weight data migration...');

    // Copy weightGrams to goldWeightGrams for Gold items
    const [goldResults] = await sequelize.query(`
      UPDATE "public"."records"
      SET "goldWeightGrams" = "weightGrams"
      WHERE "itemType" = 'Gold' AND "weightGrams" IS NOT NULL;
    `);

    console.log(`Updated ${goldResults.rowCount || goldResults} Gold records`);

    // Copy weightGrams to silverWeightGrams for Silver items
    const [silverResults] = await sequelize.query(`
      UPDATE "public"."records"
      SET "silverWeightGrams" = "weightGrams"
      WHERE "itemType" = 'Silver' AND "weightGrams" IS NOT NULL;
    `);

    console.log(
      `Updated ${silverResults.rowCount || silverResults} Silver records`
    );

    // For 'Both' items, copy weightGrams to both fields
    const [bothResults] = await sequelize.query(`
      UPDATE "public"."records"
      SET "goldWeightGrams" = "weightGrams", "silverWeightGrams" = "weightGrams"
      WHERE "itemType" = 'Both' AND "weightGrams" IS NOT NULL;
    `);

    console.log(`Updated ${bothResults.rowCount || bothResults} Both records`);

    console.log('Weight data migration completed successfully!');
  } catch (error) {
    console.error('Error during weight data migration:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the migration if this script is executed directly
if (require.main === module) {
  migrateWeightData();
}

module.exports = migrateWeightData;
