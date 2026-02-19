import { Router } from 'express';
import { getQuiz, submitQuiz, getQuizAttempts, createQuiz, updateQuiz, deleteQuiz } from '../controllers/quizController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Student Routes
router.get('/:lessonId', getQuiz);
router.post('/submit', authenticate, submitQuiz);
router.get('/attempts/:quizId', authenticate, getQuizAttempts);

// Instructor/Admin Routes
router.post('/', authenticate, authorize('INSTRUCTOR', 'ADMIN'), createQuiz);
router.put('/:id', authenticate, authorize('INSTRUCTOR', 'ADMIN'), updateQuiz);
router.delete('/:id', authenticate, authorize('INSTRUCTOR', 'ADMIN'), deleteQuiz);

export default router;