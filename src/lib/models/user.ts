import { DataTypes, Model, Optional } from 'sequelize';
import { getSequelize } from '../db';

interface UserAttributes {
  id: number;
  email: string;
  passwordHash: string;
  name: string;
  roleId: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  Role?: any; // Add this for the association
}

type UserCreationAttributes = Optional<UserAttributes, 'id' | 'isActive'>;

export class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  declare id: number;
  declare email: string;
  declare passwordHash: string;
  declare name: string;
  declare roleId: number;
  declare isActive: boolean;
  declare createdAt: Date;
  declare updatedAt: Date;
}

let initialized = false;

async function initializeModel() {
  if (!initialized) {
    const sequelize = await getSequelize();

    User.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        email: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
        passwordHash: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        roleId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'roles',
            key: 'id',
          },
        },
        isActive: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: 'users',
        schema: 'auth',
        timestamps: true,
      }
    );

    initialized = true;
  }
}

export async function getUserModel() {
  await initializeModel();
  return User;
}

export default User;
