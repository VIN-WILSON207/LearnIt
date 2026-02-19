import { Router } from 'express';
import {
    handleCourseAction,
    handleForumAction,
    getCourseReviewRequests,
    handleCourseReviewRequestAction,
} from '../controllers/adminController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Course Moderation
router.post('/courses/:id/action', authenticate, authorize('ADMIN'), handleCourseAction);
router.get('/courses/review-requests', authenticate, authorize('ADMIN'), getCourseReviewRequests);
router.post('/courses/review-requests/:id/action', authenticate, authorize('ADMIN'), handleCourseReviewRequestAction);

// Forum Moderation
router.post('/forum/:id/action', authenticate, authorize('ADMIN'), handleForumAction);

export default router;
