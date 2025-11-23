'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'records',
      'goldWeightGrams',
      {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      { schema: 'public' }
    );
    await queryInterface.addColumn(
      'records',
      'silverWeightGrams',
      {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      { schema: 'public' }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('records', 'goldWeightGrams', {
      schema: 'public',
    });
    await queryInterface.removeColumn('records', 'silverWeightGrams', {
      schema: 'public',
    });
  },
};
