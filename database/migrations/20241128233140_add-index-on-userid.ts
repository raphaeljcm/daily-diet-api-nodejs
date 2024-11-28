import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('meals', table => {
    table.index(['user_id'], 'idx_meals_user_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('meals', table => {
    table.dropIndex(['user_id'], 'idx_meals_user_id');
  });
}
