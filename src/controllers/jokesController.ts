import { Request, Response } from 'express';
import Joke from '../models/joke';
import User from '../models/user';
import Theme from '../models/theme';
import chuckService from '../services/chuckService';
import dadService from '../services/dadService';
import client from '../elasticsearch'; // Importa el cliente de Elasticsearch

export const getRandomJoke = async (req: Request, res: Response) => {
  const { type } = req.params;
  if (!type) {
    return res.json(await chuckService.getRandomJoke());
  }
  if (type === 'Chuck') {
    return res.json(await chuckService.getRandomJoke());
  }
  if (type === 'Dad') {
    return res.json(await dadService.getRandomJoke());
  }
  return res.status(400).json({ error: 'Invalid type' });
};

export const saveJoke = async (req: Request, res: Response) => {
  const { title, body, themeIds } = req.body;
  if (!title ) {
    return res.status(400).json({ error: 'Title is required' });
  }
  if (!body ) {
    return res.status(400).json({ error: 'Body is required' });
  }
  const authorId = req.user.id; // Obtener el ID del usuario autenticado

  try {
    const joke = await Joke.create({ title, body, author_id: authorId });
    if (themeIds && themeIds.length > 0) {
      await joke.setThemes(themeIds);
    }

    // Indexar en Elasticsearch
    await client.index({
      index: 'jokes',
      body: {
        id: joke.id,
        title: joke.title,
        body: joke.body,
      },
    });

    res.status(201).json(joke);
  } catch (error: any) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      res.status(400).json({ error: 'Joke title already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create joke' });
    }
  }
};

export const updateJoke = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, body } = req.body;
  const joke = await Joke.findByPk(id);
  if (!joke) {
    return res.status(404).json({ error: 'Joke not found' });
  }
  joke.title = title;
  joke.body = body;
  await joke.save();
  res.json(joke);
};

export const deleteJoke = async (req: Request, res: Response) => {
  const { id } = req.params;
  const joke = await Joke.findByPk(id);
  if (!joke) {
    return res.status(404).json({ error: 'Joke not found' });
  }
  await joke.destroy();
  res.status(204).send();
};

export const getJokesFromElastic = async (req: Request, res: Response) => {
  const { query } = req.query;

  if (typeof query !== 'string') {
    return res.status(400).json({ error: 'Query parameter is required and must be a string' });
  }

  try {
    const result = await client.search({
      index: 'jokes',
      body: {
        query: {
          match: {
            title: query,
          },
        },
      },
    });

    // El tipo correcto para result
    // const hits = result.hits.hits;

    res.status(200).json(result);
  } catch (error) {
    console.error('Failed to search jokes:', error);  // Log error
    res.status(500).json({ error: 'Failed to search jokes' });
  }
};