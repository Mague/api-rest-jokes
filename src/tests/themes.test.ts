import request from 'supertest';
import express from 'express';
import sequelize from '../db';
import themesRoutes from '../routes/themes';
import usersRoutes from '../routes/users';

// Configurar la aplicación para pruebas
const app = express();
app.use(express.json());
app.use('/themes', themesRoutes);
app.use('/users', usersRoutes);

let token: string;
const generateRandomUsername = () => `testuserTheme_${Math.random().toString(36).substring(2, 15)}`;
const newUser = { name:generateRandomUsername(), password: 'newpass' };
const themeTest = `Test Theme ${Math.random().toString(36).substring(7)}`;
const duplicateThemeTest = `Duplicate Theme ${Math.random().toString(36).substring(7)}`;

beforeAll(async () => {
  // Sincronizar la base de datos
  await sequelize.sync({ force: true });

  // Crear un usuario y obtener el token de autenticación
  await request(app).post('/users/register').send({ name: newUser.name, password: newUser.password });
  const response = await request(app).post('/users/login').send({ name: newUser.name, password: newUser.password });
  token = response.body.token;
});

afterAll(async () => {
  // Cerrar la conexión a la base de datos
  await sequelize.close();
});

describe('POST /themes', () => {
  it('should create a theme', async () => {
    const response = await request(app)
      .post('/themes')
      .send({ name: themeTest })
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('name', themeTest);
  });

  it('should return a 400 error for duplicate theme name', async () => {
    await request(app)
      .post('/themes')
      .send({ name: duplicateThemeTest })
      .set('Authorization', `Bearer ${token}`);
    const response = await request(app)
      .post('/themes')
      .send({ name: duplicateThemeTest })
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Theme already exists');
  });
});

describe('GET /themes', () => {
  it('should return a list of themes', async () => {
    const response = await request(app)
      .get('/themes')
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
  });
});
