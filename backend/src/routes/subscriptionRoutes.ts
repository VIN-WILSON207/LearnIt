import { Router } from 'express';
import { getPlans, subscribe, getUserSubscriptions, checkAccess, getAllPlans, createPlan, updatePlan, deletePlan, getAllSubscriptions } from '../controllers/subscriptionController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Public
router.get('/plans', getPlans);

// Student
router.post('/subscribe', authenticate, subscribe);
router.get('/my', authenticate, getUserSubscriptions);
router.get('/access', authenticate, checkAccess);

// Admin Routes
router.get('/admin/plans', authenticate, authorize('ADMIN'), getAllPlans);
router.post('/admin/plans', authenticate, authorize('ADMIN'), createPlan);
router.put('/admin/plans/:id', authenticate, authorize('ADMIN'), updatePlan);
router.delete('/admin/plans/:id', authenticate, authorize('ADMIN'), deletePlan);
router.get('/admin/all', authenticate, authorize('ADMIN'), getAllSubscriptions);

export default router;