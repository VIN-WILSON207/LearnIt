import { Router } from 'express';
import { getEnrollments, enrollInCourse, getStudentsByInstructor } from '../controllers/enrollmentController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getEnrollments);
router.get('/instructor/:instructorId', authenticate, getStudentsByInstructor);
router.post('/', authenticate, enrollInCourse);

export default router;
