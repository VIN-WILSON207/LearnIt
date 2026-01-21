
import { Router } from 'express';
import { createCourse, uploadLesson, getInstructorCourses, getCourseById, getAllCourses } from '../controllers/courseController';
import upload from '../middleware/upload';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Routes
router.get('/', getAllCourses); // Public
router.post('/', authenticate, authorize('INSTRUCTOR', 'ADMIN'), createCourse);
router.post('/lesson', authenticate, authorize('INSTRUCTOR', 'ADMIN'), upload.single('video'), uploadLesson); // 'video' is the field name
router.get('/instructor/:instructorId', authenticate, getInstructorCourses);
router.get('/:id', getCourseById);

export default router;
