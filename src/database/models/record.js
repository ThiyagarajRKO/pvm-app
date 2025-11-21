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
      slNo: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        defaultValue: DataTypes.NOW,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      fatherName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      street: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      place: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      weightGrams: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      item: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      itemType: {
        type: DataTypes.ENUM('Gold', 'Silver'),
        allowNull: true,
      },
      itemCategory: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'active',
        validate: {
          isIn: [['archived', 'active', 'big']],
        },
      },
      amount: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      mobile: {
        type: DataTypes.STRING,
        allowNull: true,
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
      returnedDate: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Date when the item was returned',
      },
      interest: {
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
