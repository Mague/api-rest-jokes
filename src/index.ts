import express from 'express';
import sequelize from './db';
import client from './elasticsearch';
import User from './models/user';
import Theme from './models/theme';
import Joke from './models/joke';
import jokesRoutes from './routes/jokes';
import routes from './routes';
import { setupSwagger } from './swagger';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/', routes);

setupSwagger(app);

async function initialize() {
  try {
    await sequelize.authenticate();
    console.log('Connection to PostgreSQL has been established successfully.');
    await User.sync({ force: true });
    await Theme.sync({ force: true });
    await Joke.sync({ force: true });
    // Registra los modelos
// Definir las asociaciones después de inicializar los modelos
    Joke.belongsToMany(Theme, { through: 'joke_themes' });
    Theme.belongsToMany(Joke, { through: 'joke_themes' });
    await sequelize.sync({
      force: true,
      logging: console.log // Esto imprimirá las consultas SQL en la consola
    });
    console.log('PostgreSQL has been synced.');

    const esInfo = await client.info();
    console.log('Connection to ElasticSearch has been established successfully:', esInfo);
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  initialize();
});
