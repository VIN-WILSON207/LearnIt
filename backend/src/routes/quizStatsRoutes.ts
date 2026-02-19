import { Router } from 'express';
import {
    getQuizStats,
    getUserQuizStats,
    getCourseQuizStats,
    getLeaderboard,
} from '../controllers/quizStatsController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/:quizId', authenticate, getQuizStats);
router.get('/user/:userId', authenticate, getUserQuizStats);
router.get('/course/:courseId', authenticate, getCourseQuizStats);
router.get('/leaderboard', authenticate, getLeaderboard);

export default router;
