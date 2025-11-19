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
    // Try to import the pg package and pass it as dialectModule so Sequelize
    // doesn't attempt to require it dynamically at runtime. This helps with
    // environments where bundlers or server runtimes can't resolve optional
    // dialect packages.
    let pgModule: any = null;
    try {
      pgModule = await import('pg');
      // Some bundlers export default under .default
      pgModule = pgModule && (pgModule.default || pgModule);
    } catch (err) {
      // If pg is not installed we'll still initialize Sequelize but it'll
      // throw a clearer error when connecting. Keep the original error
      // message for the developer.
      console.warn(
        'pg module not found. If you are using Postgres, run `npm install pg`'
      );
    }
    sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
      host: DB_HOST,
      port: DB_PORT,
      dialect: 'postgres',
      // Pass the pg module directly if available so Sequelize doesn't try to
      // require it dynamically (and fail) in some runtimes.
      ...(pgModule ? { dialectModule: pgModule } : {}),
      dialectOptions:
        DB_SSLMODE !== 'disable'
          ? { ssl: { rejectUnauthorized: false } }
          : undefined,
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
