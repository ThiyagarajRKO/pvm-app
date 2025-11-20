import { DataTypes, Model, Optional } from 'sequelize';
import { getSequelize } from '../db';

interface RoleAttributes {
  id: number;
  name: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

type RoleCreationAttributes = Optional<RoleAttributes, 'id' | 'description'>;

export class Role
  extends Model<RoleAttributes, RoleCreationAttributes>
  implements RoleAttributes
{
  declare id: number;
  declare name: string;
  declare description?: string;
  declare createdAt: Date;
  declare updatedAt: Date;
}

let initialized = false;

async function initializeModel() {
  if (!initialized) {
    const sequelize = await getSequelize();

    Role.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
        description: {
          type: DataTypes.STRING,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: 'roles',
        schema: 'auth',
        timestamps: true,
      }
    );

    initialized = true;
  }
}

export async function getRoleModel() {
  await initializeModel();
  return Role;
}

export default Role;
