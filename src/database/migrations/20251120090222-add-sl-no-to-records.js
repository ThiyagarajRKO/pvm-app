'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // First, add the column as nullable
    await queryInterface.addColumn(
      'records',
      'slNo',
      {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      { schema: 'public' }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('records', 'slNo', { schema: 'public' });
  },
};
