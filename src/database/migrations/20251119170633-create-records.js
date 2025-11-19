'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'records',
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        date: {
          type: Sequelize.DATEONLY,
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        fatherName: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        street: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        place: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        weightGrams: {
          type: Sequelize.FLOAT,
          allowNull: false,
        },
        itemType: {
          type: Sequelize.ENUM('Gold', 'Silver'),
          allowNull: false,
        },
        itemCategory: {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: 'active',
          validate: {
            isIn: [['archived', 'active', 'big']],
          },
        },
        amount: {
          type: Sequelize.FLOAT,
          allowNull: false,
        },
        mobile: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        personImageUrl: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        itemImageUrl: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        itemReturnImageUrl: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
      },
      {
        schema: 'public',
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('records', { schema: 'public' });
  },
};
