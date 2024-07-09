import { Router } from 'express';
import jokesRoutes from './jokes';
import mathRoutes from './math';
import usersRoutes from './users';
import themesRoutes from './themes';

const router = Router();

router.use('/jokes', jokesRoutes);
router.use('/math', mathRoutes);
router.use('/users', usersRoutes);
router.use('/themes', themesRoutes);

export default router;
