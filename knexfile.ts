import { Knex } from 'knex';
import { env } from '@/env';

const DATABASE_CONNECTION =
  env.DATABASE_CLIENT === 'sqlite'
    ? {
        filename: env.DATABASE_URL,
      }
    : env.DATABASE_URL;
const POOL_CONFIG =
  env.DATABASE_CLIENT === 'sqlite'
    ? {
        afterCreate: (connection: any, done: any) => {
          connection.run('PRAGMA foreign_keys = ON');
          done();
        },
      }
    : {};

export default {
  client: env.DATABASE_CLIENT,
  connection: DATABASE_CONNECTION,
  migrations: {
    extensions: 'ts',
    directory: './database/migrations',
  },
  pool: POOL_CONFIG,
  useNullAsDefault: true,
} as Knex.Config;
