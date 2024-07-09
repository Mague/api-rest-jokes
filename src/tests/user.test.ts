import request from 'supertest';
import express from 'express';
import sequelize from '../db'; // Asegúrate de importar sequelize
import usersRoutes from '../routes/users';

// Configurar la aplicación para pruebas
const app = express();
app.use(express.json());
app.use('/users', usersRoutes);

beforeAll(async () => {
  await sequelize.sync({ force: true }); // Sincroniza la base de datos antes de todas las pruebas
});

afterAll(async () => {
  // Cerrar la conexión a la base de datos
  await sequelize.close();
});

const newUser = { name: `newuser${Math.random().toString(36).substring(7)}`, password: 'newpass' };
const nonExistentuser = { name: `nonexistentuser${Math.random().toString(36).substring(7)}`, password: 'newpass' };

describe('POST /users/register', () => {
  it('should register a new user', async () => {
    const response = await request(app)
      .post('/users/register')
      .send({ name: newUser.name, password: newUser.password });
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('name', newUser.name);
  });

  it('should return a 400 error for duplicate user name', async () => {
    await request(app)
      .post('/users/register')
      .send({ name: newUser.name, password: newUser.password });
    const response = await request(app)
      .post('/users/register')
      .send({ name: newUser.name, password: newUser.password });
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'User already exists');
  });
});

describe('POST /users/login', () => {
  it('should login a user and return a token', async () => {
    await request(app).post('/users/register').send({ name: newUser.name, password: newUser.password });
    const response = await request(app)
      .post('/users/login')
      .send({ name: newUser.name, password: newUser.password });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });

  it('should return a 401 error for invalid credentials', async () => {
    const response = await request(app)
      .post('/users/login')
      .send({ name: nonExistentuser.name, password: nonExistentuser.password });
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error', 'Invalid credentials');
  });
});
