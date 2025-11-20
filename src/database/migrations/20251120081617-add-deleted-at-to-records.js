'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'records',
      'deletedAt',
      {
        type: Sequelize.DATE,
        allowNull: true,
      },
      { schema: 'public' }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('records', 'deletedAt', {
      schema: 'public',
    });
  },
};
