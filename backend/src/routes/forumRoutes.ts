import { Router } from 'express';
import { createPost, getPosts, addComment, getPostsQuery, getForumReports } from '../controllers/forumController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/reports', authenticate, authorize('ADMIN'), getForumReports);
router.get('/', getPostsQuery);
router.post('/posts', authenticate, createPost);
router.get('/posts/:courseId', getPosts);
router.post('/comments', authenticate, addComment);

export default router;
