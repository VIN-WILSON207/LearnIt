import { Router } from 'express';
import { getPlatformAnalytics } from '../controllers/analyticsController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, authorize('ADMIN'), getPlatformAnalytics);

export default router;
