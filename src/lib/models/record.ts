import { DataTypes, Model, Optional } from 'sequelize';
import { getSequelize } from '../db';

export type ItemType = 'Gold' | 'Silver';
export type ItemCategory = 'archived' | 'active' | 'big';

interface RecordAttributes {
  id: number;
  slNo: string;
  date: Date;
  name: string;
  fatherName: string;
  street: string;
  place: string;
  weightGrams: number;
  item?: string | null;
  itemType: ItemType;
  itemCategory: ItemCategory;
  amount: number;
  interest: number;
  isReturned: boolean;
  returnedAmount: number;
  mobile: string;
  personImageUrl?: string | null;
  itemImageUrl?: string | null;
  itemReturnImageUrl?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

type RecordCreationAttributes = Optional<
  RecordAttributes,
  | 'id'
  | 'date'
  | 'personImageUrl'
  | 'itemImageUrl'
  | 'itemReturnImageUrl'
  | 'itemCategory'
>;

export class Record
  extends Model<RecordAttributes, RecordCreationAttributes>
  implements RecordAttributes
{
  declare id: number;
  declare slNo: string;
  declare date: Date;
  declare name: string;
  declare fatherName: string;
  declare street: string;
  declare place: string;
  declare weightGrams: number;
  declare item?: string | null;
  declare itemType: ItemType;
  declare itemCategory: ItemCategory;
  declare amount: number;
  declare interest: number;
  declare isReturned: boolean;
  declare returnedAmount: number;
  declare mobile: string;
  declare personImageUrl?: string | null;
  declare itemImageUrl?: string | null;
  declare itemReturnImageUrl?: string | null;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare deletedAt?: Date;
}

let initialized = false;

async function initializeModel() {
  if (!initialized) {
    const sequelize = await getSequelize();
    Record.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        slNo: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
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
        item: { type: DataTypes.STRING, allowNull: true },
        itemType: { type: DataTypes.ENUM('Gold', 'Silver'), allowNull: false },
        itemCategory: {
          type: DataTypes.STRING,
          allowNull: false,
          defaultValue: 'active',
          validate: {
            isIn: [['archived', 'active', 'big']],
          },
        },
        amount: { type: DataTypes.FLOAT, allowNull: false },
        interest: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
        isReturned: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        returnedAmount: {
          type: DataTypes.FLOAT,
          allowNull: true,
        },
        mobile: { type: DataTypes.STRING, allowNull: false },
        personImageUrl: { type: DataTypes.STRING, allowNull: true },
        itemImageUrl: { type: DataTypes.STRING, allowNull: true },
        itemReturnImageUrl: { type: DataTypes.STRING, allowNull: true },
      },
      {
        sequelize,
        tableName: 'records',
        schema: 'public',
        timestamps: true,
        paranoid: true,
      }
    );
    initialized = true;
  }
}

export async function getRecordModel() {
  await initializeModel();
  return Record;
}

export default Record;
