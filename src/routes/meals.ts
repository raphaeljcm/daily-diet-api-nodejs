import { FastifyInstance } from 'fastify';
import { knex } from '@/knex';
import { checkUserIdIdentity } from '@/middlewares/check-user-id-identity';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';

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

  app.get(
    '/:mealId',
    { preHandler: [checkUserIdIdentity] },
    async (req, reply) => {
      const getMealParams = z.object({
        mealId: z.string(),
      });

      const { mealId } = getMealParams.parse(req.params);
      const { userId } = req.cookies;

      const meal = await knex('meals').select().where({
        user_id: userId,
        id: mealId,
      });

      return reply.send({
        meal,
      });
    },
  );

  app.put(
    '/:mealId',
    { preHandler: [checkUserIdIdentity] },
    async (req, reply) => {
      const updateMealParams = z.object({
        mealId: z.string(),
      });
      const updateMealBodySchema = z.object({
        name: z.string(),
        description: z.string().optional(),
        mealTime: z.string(),
        followedDiet: z.boolean(),
      });
      const { userId } = req.cookies;
      const { mealId } = updateMealParams.parse(req.params);
      const { name, description, mealTime, followedDiet } =
        updateMealBodySchema.parse(req.body);

      await knex('meals')
        .update({
          name,
          description,
          meal_time: mealTime,
          followed_diet: followedDiet,
        })
        .where({
          id: mealId,
          user_id: userId,
        });

      return reply.status(204).send();
    },
  );

  app.post('/', async (req, reply) => {
    const createMealSchema = z.object({
      name: z.string(),
      description: z.string().optional(),
      mealTime: z.string(),
      followedDiet: z.boolean(),
    });

    const { name, description, mealTime, followedDiet } =
      createMealSchema.parse(req.body);

    let userId = req.cookies.userId;

    if (!userId) {
      userId = randomUUID();
      reply.cookie('userId', userId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }

    await knex('meals').insert({
      id: randomUUID(),
      name,
      description,
      meal_time: mealTime,
      followed_diet: followedDiet,
      user_id: userId,
    });

    return reply.status(201).send();
  });
}
