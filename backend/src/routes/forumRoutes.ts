import { Router } from 'express';
import { createPost, getPosts, addComment } from '../controllers/forumController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/posts', authenticate, createPost);
router.get('/posts/:courseId', getPosts);
router.post('/comments', authenticate, addComment);

export default router;