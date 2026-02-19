
import { Router } from 'express';
import {
    createCourse,
    uploadLesson,
    getInstructorCourses,
    getCourseById,
    getAllCourses,
    submitCourseUpdates,
    requestCourseUnpublish,
} from '../controllers/courseController';
import upload from '../middleware/upload';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getAllCourses);
router.post('/', authenticate, authorize('INSTRUCTOR', 'ADMIN'), createCourse);
router.post('/lesson', authenticate, authorize('INSTRUCTOR', 'ADMIN'), upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'attachment', maxCount: 1 }
]), uploadLesson);
router.get('/instructor/:instructorId', authenticate, getInstructorCourses);
router.get('/:id', authenticate, getCourseById);
router.patch('/:id', authenticate, authorize('INSTRUCTOR', 'ADMIN'), submitCourseUpdates);
router.post('/:id/unpublish-request', authenticate, authorize('INSTRUCTOR', 'ADMIN'), requestCourseUnpublish);

export default router;
