import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('meals', table => {
    table.uuid('id').primary();
    table.uuid('user_id').notNullable();
    table.text('name').notNullable();
    table.text('description');
    table.boolean('followed_diet').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('meals');
}
