'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add 'Both' to the existing enum
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_records_itemType" ADD VALUE 'Both';
    `);
  },

  async down(queryInterface, Sequelize) {
    // Note: PostgreSQL doesn't support removing enum values directly
    // In a production environment, you would need to:
    // 1. Create a new enum without 'Both'
    // 2. Update the column to use the new enum
    // 3. Drop the old enum
    // For this development context, we'll leave it as is
    console.log(
      'Cannot remove enum value in PostgreSQL. Manual intervention required if rollback needed.'
    );
  },
};
