import request from 'supertest';
import { afterAll, beforeEach, beforeAll, describe, it, expect } from 'vitest';
import { execSync } from 'node:child_process';
import { app } from '@/app';

beforeAll(async () => {
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

beforeEach(() => {
  // database clean up
  execSync('npm run knex -- migrate:rollback --all');
  execSync('npm run knex -- migrate:latest');
});

describe('Meals routes', () => {
  it('should create a new meal', async () => {
    await request(app.server)
      .post('/meals')
      .send({
        name: 'Hamburguer',
        followedDiet: false,
        mealTime: '2024-12-01T20:54:20.914Z',
      })
      .expect(201);
  });
  it('should update a meal', async () => {
    const createMealResponse = await request(app.server)
      .post('/meals')
      .send({
        name: 'Hamburguer',
        followedDiet: false,
        mealTime: '2024-12-01T20:54:20.914Z',
      })
      .expect(201);
    const cookies = createMealResponse.get('Set-Cookie')!;

    const getMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies);

    const mealId = getMealsResponse.body.meals[0].id;

    await request(app.server)
      .put(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .send({
        name: 'Hamburguer 2',
        followedDiet: false,
        mealTime: '2024-12-01T20:54:20.914Z',
      })
      .expect(204);

    const getMealResponse = await request(app.server)
      .get(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .expect(200);

    expect(getMealResponse.body.meal).toEqual(
      expect.objectContaining({
        name: 'Hamburguer 2',
      }),
    );
  });
  it('should delete a meal', async () => {
    const createMealResponse = await request(app.server)
      .post('/meals')
      .send({
        name: 'Hamburguer',
        followedDiet: false,
        mealTime: '2024-12-01T20:54:20.914Z',
      })
      .expect(201);
    const cookies = createMealResponse.get('Set-Cookie')!;

    const getMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies);

    const mealId = getMealsResponse.body.meals[0].id;

    await request(app.server)
      .delete(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .expect(204);

    const getMealsResponse2 = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies);

    expect(getMealsResponse2.body.meals).length(0);
  });
  it('should list all meals of a user', async () => {
    const createMealResponse = await request(app.server).post('/meals').send({
      name: 'Hamburguer',
      followedDiet: false,
      mealTime: '2024-12-01T20:54:20.914Z',
    });
    const cookies = createMealResponse.get('Set-Cookie')!;

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'Almoço',
      followedDiet: true,
      mealTime: '2024-12-01T20:54:20.914Z',
    });

    const getMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies);

    expect(getMealsResponse.body.meals).toEqual([
      expect.objectContaining({
        name: 'Hamburguer',
      }),
      expect.objectContaining({
        name: 'Almoço',
      }),
    ]);
  });
  it('should list a single meal of a user', async () => {
    const createMealResponse = await request(app.server)
      .post('/meals')
      .send({
        name: 'Hamburguer',
        followedDiet: false,
        mealTime: '2024-12-01T20:54:20.914Z',
      })
      .expect(201);
    const cookies = createMealResponse.get('Set-Cookie')!;

    const getMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies);

    const mealId = getMealsResponse.body.meals[0].id;

    const getMealResponse = await request(app.server)
      .get(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .expect(200);

    expect(getMealResponse.body.meal).toEqual(
      expect.objectContaining({
        name: 'Hamburguer',
      }),
    );
  });
  it('should list the user metrics', async () => {
    const createMealResponse = await request(app.server).post('/meals').send({
      name: 'Hamburguer',
      followedDiet: false,
      mealTime: '2024-12-01T20:54:20.914Z',
    });
    const cookies = createMealResponse.get('Set-Cookie')!;
    await request(app.server)
      .post('/meals')
      .send({
        name: 'Almoço',
        followedDiet: true,
        mealTime: '2024-12-01T20:54:20.914Z',
      })
      .set('Cookie', cookies);

    await request(app.server)
      .post('/meals')
      .send({
        name: 'Janta',
        followedDiet: true,
        mealTime: '2024-12-01T20:54:20.914Z',
      })
      .set('Cookie', cookies);

    const getUserMetricsResponse = await request(app.server)
      .get('/meals/metrics')
      .set('Cookie', cookies)
      .expect(200);

    expect(getUserMetricsResponse.body.metrics).toEqual(
      expect.objectContaining({
        totalMeals: 3,
        totalFollowedMeals: 2,
        totalUnfollowedMeals: 1,
        bestSequence: 2,
      }),
    );
  });
  it('should not allow to list meals without having created an user', async () => {
    await request(app.server).get('/meals').expect(401);
  });
});
