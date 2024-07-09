import { Model, DataTypes } from 'sequelize';
import sequelize from '../db';

class User extends Model {
    public id!: number;
    public name!: string;
    public password!: string;
}

User.init({
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'User',
  tableName: 'users',
  timestamps: true
});

export default User;
