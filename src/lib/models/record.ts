import { DataTypes, Model, Optional } from 'sequelize';
import { getSequelize } from '../db';

export type ItemType = 'Gold' | 'Silver' | 'Both';
export type ItemCategory = 'archived' | 'active' | 'big';

interface RecordAttributes {
  id: number;
  slNo: string;
  date?: Date;
  name?: string;
  fatherName?: string;
  street?: string;
  place?: string;
  weightGrams?: number;
  goldWeightGrams?: number;
  silverWeightGrams?: number;
  item?: string | null;
  itemType?: ItemType;
  itemCategory?: ItemCategory;
  amount?: number;
  interest?: number;
  isReturned: boolean;
  returnedAmount?: number;
  returnedDate?: Date | null;
  mobile?: string;
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
  | 'name'
  | 'fatherName'
  | 'street'
  | 'place'
  | 'weightGrams'
  | 'goldWeightGrams'
  | 'silverWeightGrams'
  | 'itemType'
  | 'amount'
  | 'interest'
  | 'returnedAmount'
  | 'mobile'
  | 'personImageUrl'
  | 'itemImageUrl'
  | 'itemReturnImageUrl'
  | 'itemCategory'
  | 'returnedDate'
>;

export class Record
  extends Model<RecordAttributes, RecordCreationAttributes>
  implements RecordAttributes
{
  declare id: number;
  declare slNo: string;
  declare date?: Date;
  declare name?: string;
  declare fatherName?: string;
  declare street?: string;
  declare place?: string;
  declare weightGrams?: number;
  declare goldWeightGrams?: number;
  declare silverWeightGrams?: number;
  declare item?: string | null;
  declare itemType?: ItemType;
  declare itemCategory?: ItemCategory;
  declare amount?: number;
  declare interest?: number;
  declare isReturned: boolean;
  declare returnedAmount?: number;
  declare returnedDate?: Date | null;
  declare mobile?: string;
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
          allowNull: true,
          defaultValue: DataTypes.NOW,
        },
        name: { type: DataTypes.STRING, allowNull: true },
        fatherName: { type: DataTypes.STRING, allowNull: true },
        street: { type: DataTypes.STRING, allowNull: true },
        place: { type: DataTypes.STRING, allowNull: true },
        weightGrams: { type: DataTypes.FLOAT, allowNull: true },
        goldWeightGrams: { type: DataTypes.FLOAT, allowNull: true },
        silverWeightGrams: { type: DataTypes.FLOAT, allowNull: true },
        item: { type: DataTypes.STRING, allowNull: true },
        itemType: {
          type: DataTypes.ENUM('Gold', 'Silver', 'Both'),
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
        amount: { type: DataTypes.FLOAT, allowNull: true },
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
        returnedDate: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        mobile: { type: DataTypes.STRING, allowNull: true },
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
