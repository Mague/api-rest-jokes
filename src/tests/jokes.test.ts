import request from 'supertest';
import express from 'express';
import sequelize from '../db'; // Asegúrate de importar sequelize
import jokesRoutes from '../routes/jokes';
import usersRoutes from '../routes/users';
import themesRoutes from '../routes/themes';

// Configurar la aplicación para pruebas
const app = express();
app.use(express.json());
app.use('/jokes', jokesRoutes);
app.use('/users', usersRoutes);
app.use('/themes', themesRoutes);

let token: string;

beforeAll(async () => {
  // Crear un usuario y obtener el token de autenticación
  await request(app).post('/users/register').send({ name: 'testuser', password: 'testpass' });
  const response = await request(app).post('/users/login').send({ name: 'testuser', password: 'testpass' });
  token = response.body.token;
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

describe('POST /jokes', () => {
  const generateRandomJoke = () => ({
    title: `Test Joke ${Math.random().toString(36).substring(7)}`,
    body: 'This is a test joke.',
  });

  let themeId: number;

  beforeAll(async () => {
    // Crear un tema para usar en las pruebas
    const themeResponse = await request(app).post('/themes').send({ name: 'testtheme' }).set('Authorization', `Bearer ${token}`);
    themeId = themeResponse.body.id;
  });
  const randomJoke = generateRandomJoke();
  it('should create a joke', async () => {
    
    const response = await request(app)
      .post('/jokes')
      .send({ ...randomJoke, themeIds: [themeId] })
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('title', randomJoke.title);
  });

  it('should not allow duplicate joke titles', async () => {
    const duplicateJoke = randomJoke;
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
});
