'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add indexes for better query performance

    // Most frequently queried column - used in almost every query to filter returned items
    await queryInterface.addIndex('records', ['isReturned'], {
      name: 'idx_records_is_returned',
      schema: 'public',
    });

    // Frequently filtered by item type
    await queryInterface.addIndex('records', ['itemType'], {
      name: 'idx_records_item_type',
      schema: 'public',
    });

    // Used for status filtering (active, archived, big)
    await queryInterface.addIndex('records', ['itemCategory'], {
      name: 'idx_records_item_category',
      schema: 'public',
    });

    // Used for date range filtering and ordering
    await queryInterface.addIndex('records', ['date'], {
      name: 'idx_records_date',
      schema: 'public',
    });

    // Used for ordering recent records
    await queryInterface.addIndex('records', ['createdAt'], {
      name: 'idx_records_created_at',
      schema: 'public',
    });

    // Used for ordering by amount
    await queryInterface.addIndex('records', ['amount'], {
      name: 'idx_records_amount',
      schema: 'public',
    });

    // Used for uniqueness checks and searches
    await queryInterface.addIndex('records', ['slNo'], {
      name: 'idx_records_sl_no',
      schema: 'public',
    });

    // Composite indexes for common query combinations

    // Common filter: isReturned + itemType (used in stats calculations)
    await queryInterface.addIndex('records', ['isReturned', 'itemType'], {
      name: 'idx_records_is_returned_item_type',
      schema: 'public',
    });

    // Common filter: isReturned + itemCategory (used in status filtering)
    await queryInterface.addIndex('records', ['isReturned', 'itemCategory'], {
      name: 'idx_records_is_returned_item_category',
      schema: 'public',
    });

    // Common filter: isReturned + date (used in date range queries)
    await queryInterface.addIndex('records', ['isReturned', 'date'], {
      name: 'idx_records_is_returned_date',
      schema: 'public',
    });

    // Used for text searches (partial indexes for non-null values)
    await queryInterface.addIndex('records', ['name'], {
      name: 'idx_records_name',
      schema: 'public',
      where: {
        name: {
          [Sequelize.Op.ne]: null,
        },
      },
    });

    await queryInterface.addIndex('records', ['fatherName'], {
      name: 'idx_records_father_name',
      schema: 'public',
      where: {
        fatherName: {
          [Sequelize.Op.ne]: null,
        },
      },
    });

    await queryInterface.addIndex('records', ['mobile'], {
      name: 'idx_records_mobile',
      schema: 'public',
      where: {
        mobile: {
          [Sequelize.Op.ne]: null,
        },
      },
    });

    await queryInterface.addIndex('records', ['street'], {
      name: 'idx_records_street',
      schema: 'public',
      where: {
        street: {
          [Sequelize.Op.ne]: null,
        },
      },
    });

    await queryInterface.addIndex('records', ['place'], {
      name: 'idx_records_place',
      schema: 'public',
      where: {
        place: {
          [Sequelize.Op.ne]: null,
        },
      },
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove indexes in reverse order

    await queryInterface.removeIndex('records', 'idx_records_place', {
      schema: 'public',
    });

    await queryInterface.removeIndex('records', 'idx_records_street', {
      schema: 'public',
    });

    await queryInterface.removeIndex('records', 'idx_records_mobile', {
      schema: 'public',
    });

    await queryInterface.removeIndex('records', 'idx_records_father_name', {
      schema: 'public',
    });

    await queryInterface.removeIndex('records', 'idx_records_name', {
      schema: 'public',
    });

    await queryInterface.removeIndex(
      'records',
      'idx_records_is_returned_date',
      {
        schema: 'public',
      }
    );

    await queryInterface.removeIndex(
      'records',
      'idx_records_is_returned_item_category',
      {
        schema: 'public',
      }
    );

    await queryInterface.removeIndex(
      'records',
      'idx_records_is_returned_item_type',
      {
        schema: 'public',
      }
    );

    await queryInterface.removeIndex('records', 'idx_records_sl_no', {
      schema: 'public',
    });

    await queryInterface.removeIndex('records', 'idx_records_amount', {
      schema: 'public',
    });

    await queryInterface.removeIndex('records', 'idx_records_created_at', {
      schema: 'public',
    });

    await queryInterface.removeIndex('records', 'idx_records_date', {
      schema: 'public',
    });

    await queryInterface.removeIndex('records', 'idx_records_item_category', {
      schema: 'public',
    });

    await queryInterface.removeIndex('records', 'idx_records_item_type', {
      schema: 'public',
    });

    await queryInterface.removeIndex('records', 'idx_records_is_returned', {
      schema: 'public',
    });
  },
};
