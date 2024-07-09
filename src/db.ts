import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('postgres://user:password@localhost:5432/jokesdb');

export default sequelize;
