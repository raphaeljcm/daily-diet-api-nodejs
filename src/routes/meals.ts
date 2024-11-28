import { FastifyInstance } from 'fastify';
import { knex } from '@/knex';
import { checkUserIdIdentity } from '@/middlewares/check-user-id-identity';

export async function mealsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', async req => {
    console.log(`[${req.method}] ${req.url}`);
  });

  app.get('/', { preHandler: [checkUserIdIdentity] }, async (req, reply) => {
    const { userId } = req.cookies;

    const meals = await knex('meals').select().where({
      user_id: userId,
    });
    return reply.send({ meals });
  });
}
