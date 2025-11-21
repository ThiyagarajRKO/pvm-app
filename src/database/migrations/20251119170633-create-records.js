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
          allowNull: true,
          defaultValue: Sequelize.NOW,
        },
        name: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        fatherName: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        street: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        place: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        weightGrams: {
          type: Sequelize.FLOAT,
          allowNull: true,
        },
        itemType: {
          type: Sequelize.ENUM('Gold', 'Silver'),
          allowNull: true,
        },
        itemCategory: {
          type: Sequelize.STRING,
          allowNull: true,
          defaultValue: 'active',
          validate: {
            isIn: [['archived', 'active', 'big']],
          },
        },
        amount: {
          type: Sequelize.FLOAT,
          allowNull: true,
        },
        mobile: {
          type: Sequelize.STRING,
          allowNull: true,
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
