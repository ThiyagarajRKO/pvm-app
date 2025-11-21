'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'records',
      'item',
      {
        type: Sequelize.STRING,
        allowNull: true,
      },
      { schema: 'public' }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('records', 'item', { schema: 'public' });
  },
};
