import request from 'supertest';
import express from 'express';
import sequelize from '../db';
import jokesRoutes from '../routes/jokes';
import usersRoutes from '../routes/users';
import themesRoutes from '../routes/themes';
import Joke from '../models/joke';
import User from '../models/user';
import Theme from '../models/theme';
import client from '../elasticsearch';

jest.mock('../elasticsearch');

// Configurar la aplicación para pruebas
const app = express();
app.use(express.json());
app.use('/jokes', jokesRoutes);
app.use('/users', usersRoutes);
app.use('/themes', themesRoutes);

let token: string;
let themeId: number;

// Funciones auxiliares
const generateRandomUsername = () => `testuser${Math.floor(Math.random() * 10000)}`;
const generateRandomPassword = () => 'password';
const generateRandomTheme = () => `Theme${Math.random().toString(36).substring(7)}`;
const generateRandomJoke = () => {
  return `Test Joke ${Math.random().toString(36).substring(7)}`;
}
const user = generateRandomUsername()
const password= generateRandomPassword()
const theme = generateRandomTheme()
beforeAll(async () => {
  await sequelize.sync({ force: true });

  // Crear un usuario y obtener el token de autenticación
  await request(app).post('/users/register').send({ name: user, password:password });
  const response = await request(app).post('/users/login').send({ name: user, password: password });
  token = response.body.token;

  // Crear un tema para usar en las pruebas
  const themeResponse = await request(app).post('/themes').send({ name: theme }).set('Authorization', `Bearer ${token}`);
  themeId = themeResponse.body.id;
});

afterAll(async () => {
  // Cerrar la conexión a la base de datos
  await sequelize.close();
});

describe('POST /jokes', () => {
  it('should create a joke', async () => {
    const randomTitle = generateRandomJoke();

    const response = await request(app)
      .post('/jokes')
      .send({ title:randomTitle,body: 'This is a test joke.', themeIds: [themeId] })
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('title', randomTitle);

    // Verifica que el chiste fue indexado en Elasticsearch
    expect(client.index).toHaveBeenCalled();
  });

  it('should return 400 if query parameter is not a string', async () => {
    const response = await request(app)
      .get('/jokes/search')
      .query({ query: ['Test'] })
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Invalid type');
  });

  it('should not allow duplicate joke titles', async () => {
    const duplicateJoke = generateRandomJoke();
    await request(app)
      .post('/jokes')
      .send({ title:duplicateJoke,body: 'This is a test joke.', themeIds: [themeId] })
      .set('Authorization', `Bearer ${token}`);
    const response = await request(app)
      .post('/jokes')
      .send({ title:duplicateJoke,body: 'This is a test joke.', themeIds: [themeId] })
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
    expect(response.body).toHaveProperty('error', 'Title is required');
  });

  it('should return 400 if no body is provided', async () => {
    const response = await request(app)
      .post('/jokes')
      .send({ title: 'Test Joke without body', themeIds: [themeId] })
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Body is required');
  });

  it('should return 500 if creating a joke fails', async () => {
    const randomJoke = generateRandomJoke();

    // Mockear el método create para que lance un error
    jest.spyOn(Joke, 'create').mockImplementation(() => {
      throw new Error('Simulated database error');
    });

    const response = await request(app)
      .post('/jokes')
      .send({ title:randomJoke,body: 'This is a test joke.', themeIds: [themeId] })
      .set('Authorization', `Bearer ${token}`);
    
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Failed to create joke');

    // Restaurar el método create
    (Joke.create as jest.Mock).mockRestore();
  });

});

describe('PUT /jokes/:id', () => {
  it('should update a joke', async () => {
    const randomJoke = generateRandomJoke();
    const createdResponse = await request(app)
      .post('/jokes')
      .send({ title:randomJoke,body: 'This is a test joke.', themeIds: [themeId] })
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
  }, 10000); // Aumentar el tiempo de espera a 10 segundos

  it('should return 404 if the joke does not exist', async () => {
    const response = await request(app)
      .put('/jokes/99999')
      .send({ title: 'Non-existent Joke', body: 'This joke does not exist.' })
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', 'Joke not found');
  });
});

// describe('POST /jokes/search', () => {
//   it('should search jokes from Elasticsearch', async () => {
//     const randomJoke = generateRandomJoke();
    
//     await request(app)
//       .post('/jokes')
//       .send({ title:randomJoke,body: 'This is a test joke.', themeIds: [themeId] })
//       .set('Authorization', `Bearer ${token}`);

//     const response = await request(app)
//       .get('/jokes/search')
//       .query({ query: randomJoke });
//     expect(response.status).toBe(200);
//     expect(response.body).toBeInstanceOf(Array);
//   });
// });

// describe('POST /jokes/search', () => {
//   it('should search jokes from Elasticsearch', async () => {
//     const randomJoke = generateRandomJoke();
    
//     await request(app)
//       .post('/jokes')
//       .send({ ...randomJoke, themeIds: [themeId] })
//       .set('Authorization', `Bearer ${token}`);

//     const response = await request(app)
//       .get('/jokes/search')
//       .query({ query: randomJoke.title });
//     expect(response.status).toBe(200);
//     expect(response.body).toBeInstanceOf(Array);
//   });
// });

// describe('DELETE /jokes/:id', () => {
//   it('should delete a joke', async () => {
//     const randomJoke = generateRandomJoke();
//     const createdResponse = await request(app)
//       .post('/jokes')
//       .send({ ...randomJoke, themeIds: [themeId] })
//       .set('Authorization', `Bearer ${token}`);

//     const response = await request(app)
//       .delete(`/jokes/${createdResponse.body.id}`)
//       .set('Authorization', `Bearer ${token}`);

//     expect(response.status).toBe(204);
//   });

//   it('should return 404 if the joke does not exist', async () => {
//     const response = await request(app)
//       .delete('/jokes/99999')
//       .set('Authorization', `Bearer ${token}`);
//     expect(response.status).toBe(404);
//     expect(response.body).toHaveProperty('error', 'Joke not found');
//   });
// });