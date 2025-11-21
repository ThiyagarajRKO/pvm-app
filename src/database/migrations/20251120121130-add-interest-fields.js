'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('records', 'interest', {
      type: Sequelize.FLOAT,
      allowNull: true,
      defaultValue: 2.5,
    });

    await queryInterface.addColumn('records', 'returnedAmount', {
      type: Sequelize.FLOAT,
      allowNull: true,
      defaultValue: 0,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('records', 'interest');
    await queryInterface.removeColumn('records', 'returnedAmount');
  },
};
