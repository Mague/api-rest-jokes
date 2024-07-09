import request from 'supertest';
import express from 'express';
import sequelize from '../db';
import jokesRoutes from '../routes/jokes';
import usersRoutes from '../routes/users';
import themesRoutes from '../routes/themes';
import User from '../models/user';
import Theme from '../models/theme';
import Joke from '../models/joke';

// Configurar la aplicación para pruebas
const app = express();
app.use(express.json());
app.use('/jokes', jokesRoutes);
app.use('/users', usersRoutes);
app.use('/themes', themesRoutes);

let token: string;
let themeId: number;

beforeAll(async () => {
  await sequelize.sync({ force: true });

  // Crear un usuario y obtener el token de autenticación
  await request(app).post('/users/register').send({ name: 'testuser', password: 'testpass' });
  const response = await request(app).post('/users/login').send({ name: 'testuser', password: 'testpass' });
  token = response.body.token;

  // Crear un tema para usar en las pruebas
  const themeResponse = await request(app).post('/themes').send({ name: 'testtheme' }).set('Authorization', `Bearer ${token}`);
  themeId = themeResponse.body.id;
});

afterAll(async () => {
  // Cerrar la conexión a la base de datos
  await sequelize.close();
});

describe('GET /jokes/:type?', () => {
  it('should return a random Chuck Norris joke when type is Chuck', async () => {
    const response = await request(app).get('/jokes/Chuck').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('value'); // Propiedad específica del API de Chuck Norris
  });

  it('should return a random Dad joke when type is Dad', async () => {
    const response = await request(app).get('/jokes/Dad').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('joke'); // Propiedad específica del API de Dad jokes
  });

  it('should return an error for invalid type', async () => {
    const response = await request(app).get('/jokes/InvalidType').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Invalid type');
  });

  it('should return a random joke when no type is provided', async () => {
    const response = await request(app).get('/jokes').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('value'); // Propiedad específica del API de Chuck Norris
  });
});
const generateRandomJoke = () => ({
    title: `Test Joke ${Math.random().toString(36).substring(7)}`,
    body: 'This is a test joke.',
  });
describe('POST /jokes', () => {
  

  it('should create a joke', async () => {
    const randomJoke = generateRandomJoke();
    const response = await request(app)
      .post('/jokes')
      .send({ ...randomJoke, themeIds: [themeId] })
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('title', randomJoke.title);
  });

  it('should not allow duplicate joke titles', async () => {
    const duplicateJoke = generateRandomJoke();
    await request(app)
      .post('/jokes')
      .send({ ...duplicateJoke, themeIds: [themeId] })
      .set('Authorization', `Bearer ${token}`);
    const response = await request(app)
      .post('/jokes')
      .send({ ...duplicateJoke, themeIds: [themeId] })
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Joke title already exists');
  });

  it('should return 400 if no title is provided', async () => {
    const response = await request(app)
      .post('/jokes')
      .send({ body: 'This is a test joke without a title.', themeIds: [themeId] })
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  it('should return 400 if no body is provided', async () => {
    const response = await request(app)
      .post('/jokes')
      .send({ title: 'Test Joke without body', themeIds: [themeId] })
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });
});

describe('PUT /jokes/:id', () => {
  it('should update a joke', async () => {
    const randomJoke = generateRandomJoke();
    const createdResponse = await request(app)
      .post('/jokes')
      .send({ ...randomJoke, themeIds: [themeId] })
      .set('Authorization', `Bearer ${token}`);

    const updatedJoke = {
      title: 'Updated Joke Title',
      body: 'Updated joke body.',
    };

    const response = await request(app)
      .put(`/jokes/${createdResponse.body.id}`)
      .send(updatedJoke)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('title', updatedJoke.title);
    expect(response.body).toHaveProperty('body', updatedJoke.body);
  });

  it('should return 404 if the joke does not exist', async () => {
    const response = await request(app)
      .put('/jokes/99999')
      .send({ title: 'Non-existent Joke', body: 'This joke does not exist.' })
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', 'Joke not found');
  });
});

describe('DELETE /jokes/:id', () => {
  it('should delete a joke', async () => {
    const randomJoke = generateRandomJoke();
    const createdResponse = await request(app)
      .post('/jokes')
      .send({ ...randomJoke, themeIds: [themeId] })
      .set('Authorization', `Bearer ${token}`);

    const response = await request(app)
      .delete(`/jokes/${createdResponse.body.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(204);
  });

  it('should return 404 if the joke does not exist', async () => {
    const response = await request(app)
      .delete('/jokes/99999')
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', 'Joke not found');
  });
});
