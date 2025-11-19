import { DataTypes, Model, Optional } from 'sequelize';
import { getSequelize } from '../db';

export type ItemType = 'Gold' | 'Silver';

interface RecordAttributes {
  id: number;
  date: Date;
  name: string;
  fatherName: string;
  street: string;
  place: string;
  weightGrams: number;
  itemType: ItemType;
  amount: number;
  mobile: string;
  personImageUrl?: string | null;
  itemImageUrl?: string | null;
  itemReturnImageUrl?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

type RecordCreationAttributes = Optional<
  RecordAttributes,
  'id' | 'date' | 'personImageUrl' | 'itemImageUrl' | 'itemReturnImageUrl'
>;

export class Record
  extends Model<RecordAttributes, RecordCreationAttributes>
  implements RecordAttributes
{
  declare id: number;
  declare date: Date;
  declare name: string;
  declare fatherName: string;
  declare street: string;
  declare place: string;
  declare weightGrams: number;
  declare itemType: ItemType;
  declare amount: number;
  declare mobile: string;
  declare personImageUrl?: string | null;
  declare itemImageUrl?: string | null;
  declare itemReturnImageUrl?: string | null;
  declare createdAt: Date;
  declare updatedAt: Date;
}

let initialized = false;

function initializeModel() {
  if (!initialized) {
    Record.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        date: {
          type: DataTypes.DATEONLY,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        name: { type: DataTypes.STRING, allowNull: false },
        fatherName: { type: DataTypes.STRING, allowNull: false },
        street: { type: DataTypes.STRING, allowNull: false },
        place: { type: DataTypes.STRING, allowNull: false },
        weightGrams: { type: DataTypes.FLOAT, allowNull: false },
        itemType: { type: DataTypes.ENUM('Gold', 'Silver'), allowNull: false },
        amount: { type: DataTypes.FLOAT, allowNull: false },
        mobile: { type: DataTypes.STRING, allowNull: false },
        personImageUrl: { type: DataTypes.STRING, allowNull: true },
        itemImageUrl: { type: DataTypes.STRING, allowNull: true },
        itemReturnImageUrl: { type: DataTypes.STRING, allowNull: true },
      },
      {
        sequelize: getSequelize(),
        tableName: 'records',
        schema: process.env.DB_SCHEMA || 'pvm',
        timestamps: true,
      }
    );
    initialized = true;
  }
}

export function getRecordModel() {
  initializeModel();
  return Record;
}

export default Record;
