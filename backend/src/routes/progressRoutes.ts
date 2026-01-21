import { Router } from 'express';
import { updateProgress, getProgress, getUserProgress } from '../controllers/progressController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, updateProgress);
router.get('/:courseId', authenticate, getProgress);
router.get('/', authenticate, getUserProgress);

export default router;