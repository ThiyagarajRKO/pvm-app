'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query('SET search_path TO auth');
    await queryInterface.bulkInsert(
      'roles',
      [
        {
          name: 'admin',
          description: 'Administrator with full access',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query('SET search_path TO auth');
    await queryInterface.bulkDelete('roles', { name: 'admin' }, {});
  },
};
