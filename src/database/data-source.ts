import 'dotenv/config';
import { DataSource } from 'typeorm';
import { allEntities } from '../entity-loader';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS,
  database: process.env.DB_NAME || 'CECyTech',
  entities: allEntities,
  migrations: ['src/database/migrations/*.ts'],
  logging: ['error', 'warn'],
});
