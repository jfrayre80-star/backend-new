import { DataSource } from 'typeorm';
import { allEntities } from '../entity-loader';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: '032022',
  database: 'CECyTech',
  entities: allEntities,
  migrations: ['src/database/migrations/*.ts'],
  logging: ['error', 'warn'],
});
