import { Router } from 'express';
import { getLCM, incrementNumber } from '../controllers/mathController';

const router = Router();

router.get('/lcm', getLCM);
router.get('/increment', incrementNumber);

export default router;
