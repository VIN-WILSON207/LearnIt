import { Router } from 'express';
import { getPlans, subscribe, getUserSubscriptions, checkAccess } from '../controllers/subscriptionController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/plans', getPlans);
router.post('/subscribe', authenticate, subscribe);
router.get('/my', authenticate, getUserSubscriptions);
router.get('/access', authenticate, checkAccess);

export default router;