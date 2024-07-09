import { Request, Response } from 'express';
import Theme from '../models/theme';

export const createTheme = async (req: Request, res: Response) => {
  const { name } = req.body;
  try {
    const theme = await Theme.create({ name });
    res.status(201).json(theme);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create theme' });
  }
};

export const getThemes = async (req: Request, res: Response) => {
  try {
    const themes = await Theme.findAll();
    res.status(200).json(themes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve themes' });
  }
};
