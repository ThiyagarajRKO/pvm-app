'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('records', 'returnedDate', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Date when the item was returned',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('records', 'returnedDate');
  },
};
