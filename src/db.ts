import { DataTypes, Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import User from './models/user';
import Theme from './models/theme';
import Joke from './models/joke';
dotenv.config();

const sequelize = new Sequelize(`postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.POSTGRES_NAME}`,);



export default sequelize;
