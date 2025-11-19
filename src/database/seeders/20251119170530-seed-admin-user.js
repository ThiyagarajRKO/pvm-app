'use strict';

const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query('SET search_path TO auth');
    const hashedPassword = await bcrypt.hash('admin123', 10); // Default password: admin123

    await queryInterface.bulkInsert(
      'users',
      [
        {
          email: 'admin@pvm.com',
          passwordHash: hashedPassword,
          name: 'PVM Admin',
          roleId: 1, // Assuming admin role id is 1
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query('SET search_path TO auth');
    await queryInterface.bulkDelete('users', { email: 'admin@pvm.com' }, {});
  },
};
