import express from 'express';
import sequelize from './db';
import client from './elasticsearch';

const app = express();
const port = 3000;

app.use(express.json());

async function initialize() {
  try {
    await sequelize.authenticate();
    console.log('Connection to PostgreSQL has been established successfully.');
    await sequelize.sync({ force: true });
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
