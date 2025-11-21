'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Record extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    // static associate(models) {
    //   // define association here
    // }
  }
  Record.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      fatherName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      street: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      place: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      weightGrams: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      item: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      itemType: {
        type: DataTypes.ENUM('Gold', 'Silver'),
        allowNull: false,
      },
      itemCategory: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'active',
        validate: {
          isIn: [['archived', 'active', 'big']],
        },
      },
      amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      mobile: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      personImageUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      itemImageUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      itemReturnImageUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      isReturned: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      returnedAmount: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Record',
      tableName: 'records',
      schema: 'public',
      timestamps: true,
    }
  );
  return Record;
};
