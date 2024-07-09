import { Router } from 'express';
import { getRandomJoke, saveJoke, updateJoke, deleteJoke, getJokesFromElastic } from '../controllers/jokesController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/:type?', getRandomJoke);
router.post('/', authenticateToken, saveJoke);
router.put('/:id', authenticateToken, updateJoke);
router.delete('/:id', authenticateToken, deleteJoke);
router.delete('/search', authenticateToken, getJokesFromElastic);

export default router;
