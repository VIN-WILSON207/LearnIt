import { Router } from 'express';
import { getQuiz, submitQuiz, getQuizAttempts } from '../controllers/quizController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/:lessonId', getQuiz);
router.post('/submit', authenticate, submitQuiz);
router.get('/attempts/:quizId', authenticate, getQuizAttempts);

export default router;