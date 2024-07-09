import { Model, DataTypes } from 'sequelize';
import sequelize from '../db';
import User from './user';
import Theme from './theme';

class Joke extends Model {
  public id!: number;
  public title!: string;
  public body!: string;
  public author_id!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Métodos de asociación
  public setThemes!: (themes: Theme[] | number[]) => Promise<void>;
}

Joke.init({
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  body: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  author_id: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id'
    }
  }
}, {
  sequelize,
  modelName: 'Joke',
  tableName: 'jokes',
  timestamps: true
});

Joke.belongsToMany(Theme, { through: 'joke_themes' });
Theme.belongsToMany(Joke, { through: 'joke_themes' });

export default Joke;
