import { Router } from 'express';
import {
    createEnrollment,
    getUserEnrollments,
    getCourseEnrollments,
    removeEnrollment,
    getAllEnrollments,
    getInstructorEnrollments,
} from '../controllers/enrollmentController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, createEnrollment);
router.get('/', authenticate, authorize('ADMIN'), getAllEnrollments);
router.get('/user/:studentId', authenticate, getUserEnrollments);
router.get('/instructor/:instructorId', authenticate, authorize('INSTRUCTOR', 'ADMIN'), getInstructorEnrollments);
router.get('/course/:courseId', authenticate, getCourseEnrollments);
router.delete('/:enrollmentId', authenticate, removeEnrollment);

export default router;
