import { Router } from 'express';
import { getEnrollments, enrollInCourse } from '../controllers/enrollmentController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getEnrollments);
router.post('/', authenticate, enrollInCourse);

export default router;
