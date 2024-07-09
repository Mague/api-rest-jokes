import { Model, DataTypes } from 'sequelize';
import sequelize from '../db';

class Theme extends Model {}
Theme.init({
  name: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'Theme',
  tableName: 'themes',
  timestamps: true
});

export default Theme;
