import { Request, Response } from 'express';
import User from '../models/user';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const saltRounds = 10;
const jwtSecret = 'your_jwt_secret';

export const createUser = async (req: Request, res: Response) => {
  const { name, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const user = await User.create({ name, password: hashedPassword });
    res.status(201).json(user);
  } catch (error: any) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      res.status(400).json({ error: 'User already exists' });
    } else {
      console.error('Failed to create user:', error);  // Log error
      res.status(500).json({ error: 'Failed to create user' });
    }
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { name, password } = req.body;
  try {
    const user = await User.findOne({ where: { name } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id }, jwtSecret, { expiresIn: '1h' });
    res.status(200).json({ token });
  } catch (error) {
    console.error('Failed to login:', error);  // Log error
    res.status(500).json({ error: 'Failed to login' });
  }
};
