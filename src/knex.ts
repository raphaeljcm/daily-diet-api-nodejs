import knexSetup from 'knex';
import config from '../knexfile';

export const knex = knexSetup(config);
