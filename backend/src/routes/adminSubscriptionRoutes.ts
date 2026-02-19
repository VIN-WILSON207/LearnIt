import { Router } from 'express';
import { authenticate } from '../middleware/auth';

import {
    getAllPlans,
    createPlan,
    updatePlan,
    deletePlan
} from '../controllers/subscriptionController';

const router = Router();

const adminOnly = (req: any, res: any, next: any) => {
    if (req.user?.role !== 'ADMIN') {
        return res.status(403).json({
            success: false,
            error: 'Only admins can access subscription plans management'
        });
    }
    next();
};

router.use(authenticate);

router.use(adminOnly);

router.get('/', getAllPlans);

router.post('/', createPlan);

router.put('/:id', updatePlan);

router.delete('/:id', deletePlan);

export default router;
