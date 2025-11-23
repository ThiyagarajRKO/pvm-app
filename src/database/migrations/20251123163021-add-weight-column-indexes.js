'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add indexes for weight columns that are frequently used in SUM operations

    // Gold weight column - frequently summed for weight calculations
    await queryInterface.addIndex('records', ['goldWeightGrams'], {
      name: 'idx_records_gold_weight_grams',
      schema: 'public',
    });

    // Silver weight column - frequently summed for weight calculations
    await queryInterface.addIndex('records', ['silverWeightGrams'], {
      name: 'idx_records_silver_weight_grams',
      schema: 'public',
    });

    // Composite indexes for weight calculations with common filters

    // Gold weight with isReturned filter (for active records weight calculations)
    await queryInterface.addIndex(
      'records',
      ['isReturned', 'goldWeightGrams'],
      {
        name: 'idx_records_is_returned_gold_weight',
        schema: 'public',
      }
    );

    // Silver weight with isReturned filter (for active records weight calculations)
    await queryInterface.addIndex(
      'records',
      ['isReturned', 'silverWeightGrams'],
      {
        name: 'idx_records_is_returned_silver_weight',
        schema: 'public',
      }
    );
  },

  async down(queryInterface, Sequelize) {
    // Remove indexes in reverse order

    await queryInterface.removeIndex(
      'records',
      'idx_records_is_returned_silver_weight',
      {
        schema: 'public',
      }
    );

    await queryInterface.removeIndex(
      'records',
      'idx_records_is_returned_gold_weight',
      {
        schema: 'public',
      }
    );

    await queryInterface.removeIndex(
      'records',
      'idx_records_silver_weight_grams',
      {
        schema: 'public',
      }
    );

    await queryInterface.removeIndex(
      'records',
      'idx_records_gold_weight_grams',
      {
        schema: 'public',
      }
    );
  },
};
