import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = Number(process.env.DB_PORT || 5432);
const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'pvm_v1';
const DB_SCHEMA = process.env.DB_SCHEMA || 'auth';
const DB_SSLMODE = process.env.DB_SSLMODE || 'disable';

let sequelize: Sequelize | null = null;

export function getSequelize() {
  if (!sequelize) {
    sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
      host: DB_HOST,
      port: DB_PORT,
      dialect: 'postgres',
      schema: DB_SCHEMA,
      ssl: DB_SSLMODE !== 'disable',
      logging: false,
    });

    // Authenticate and log on first connection
    sequelize
      .authenticate()
      .then(() => {
        console.log('Database connection has been successfully established');
      })
      .catch((error) => {
        console.error('Database connection failed:', error);
      });
  }
  return sequelize;
}

export async function ensureSchema() {
  const seq = getSequelize();
  if (DB_SCHEMA) {
    await seq.createSchema(DB_SCHEMA, {});
  }
}
