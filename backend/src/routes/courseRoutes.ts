
import { Router } from 'express';
import { createCourse, uploadLesson, getInstructorCourses, getCourseById, getAllCourses, updateCourse, publishCourse, unpublishCourse, deleteCourse } from '../controllers/courseController';
import upload from '../middleware/upload';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Routes
router.get('/', getAllCourses); // Public
router.post('/', authenticate, authorize('INSTRUCTOR', 'ADMIN'), upload.single('thumbnail'), createCourse);
router.post('/lesson', authenticate, authorize('INSTRUCTOR', 'ADMIN'), upload.single('video'), uploadLesson); // 'video' is the field name
router.get('/instructor/:instructorId', authenticate, getInstructorCourses);
router.get('/:id', getCourseById);
router.patch('/:id', authenticate, authorize('INSTRUCTOR', 'ADMIN'), upload.single('thumbnail'), updateCourse);
router.patch('/:id/publish', authenticate, authorize('ADMIN'), publishCourse);
router.patch('/:id/unpublish', authenticate, authorize('ADMIN'), unpublishCourse);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteCourse);

export default router;
