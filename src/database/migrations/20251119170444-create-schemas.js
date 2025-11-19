'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create schemas
    await queryInterface.sequelize.query('CREATE SCHEMA IF NOT EXISTS auth;');
  },

  async down(queryInterface, Sequelize) {
    // Drop schemas (be careful, this will drop all tables in them)
    await queryInterface.sequelize.query('DROP SCHEMA IF EXISTS auth CASCADE;');
  },
};
