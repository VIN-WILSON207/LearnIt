import { Router } from 'express';
import {
    getOverallAnalytics,
    getCourseAnalytics,
    getUserAnalytics,
    getEngagementMetrics,
} from '../controllers/analyticsController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, authorize('ADMIN'), getOverallAnalytics);
router.get('/course/:courseId', authenticate, getCourseAnalytics);
router.get('/user/:userId', authenticate, getUserAnalytics);
router.get('/engagement', authenticate, authorize('ADMIN'), getEngagementMetrics);

export default router;
