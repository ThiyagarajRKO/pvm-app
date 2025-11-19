import dotenv from 'dotenv';

dotenv.config();

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = Number(process.env.DB_PORT || 5432);
const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'pvm_v1';
const DB_SCHEMA = process.env.DB_SCHEMA || 'auth';
const DB_SSLMODE = process.env.DB_SSLMODE || 'disable';

let sequelize: any = null;

export async function getSequelize() {
  if (!sequelize) {
    const { Sequelize } = await import('sequelize');
    sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
      host: DB_HOST,
      port: DB_PORT,
      dialect: 'postgres',
      schema: DB_SCHEMA,
      ssl: DB_SSLMODE !== 'disable',
      logging: false,
    });

    // Authenticate and log on first connection
    try {
      await sequelize.authenticate();
      console.log('Database connection has been successfully established');
    } catch (error) {
      console.error('Database connection failed:', error);
    }
  }
  return sequelize;
}

export async function ensureSchema() {
  const seq = await getSequelize();
  if (DB_SCHEMA) {
    await seq.createSchema(DB_SCHEMA, {});
  }
}
