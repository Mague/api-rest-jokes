import { Request, Response } from 'express';
import Theme from '../models/theme';

export const createTheme = async (req: Request, res: Response) => {
  const { name } = req.body;
  try {
    const theme = await Theme.create({ name });
    res.status(201).json(theme);
  } catch (error: any) {
    // console.error('Error creating theme:', error);  // Log the error for debugging
    if (error.name === 'SequelizeUniqueConstraintError') {
      res.status(400).json({ error: 'Theme already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create theme', details: error.message });
    }
  }
};

export const getThemes = async (req: Request, res: Response) => {
  try {
    const themes = await Theme.findAll();
    res.status(200).json(themes);
  } catch (error:any) {
    console.error('Error retrieving themes:', error);  // Log the error for debugging
    res.status(500).json({ error: 'Failed to retrieve themes', details: error.message });
  }
};
