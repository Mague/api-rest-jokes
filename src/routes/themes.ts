import { Router } from 'express';
import { createTheme, getThemes } from '../controllers/themesController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/', authenticateToken, createTheme);
router.get('/', authenticateToken, getThemes);

export default router;
