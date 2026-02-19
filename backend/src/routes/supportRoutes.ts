import { Router } from 'express';
import {
    createMessage,
    getUserMessages,
    getMessage,
    getAllMessages,
    addResponse,
    updateMessageStatus,
} from '../controllers/supportController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// User routes
router.post('/', authenticate, createMessage);
router.get('/my', authenticate, getUserMessages);
router.get('/:id', authenticate, getMessage);

// Admin routes
router.get('/', authenticate, authorize('ADMIN'), getAllMessages);
router.post('/:id/response', authenticate, authorize('ADMIN'), addResponse);
router.put('/:id/status', authenticate, authorize('ADMIN'), updateMessageStatus);

export default router;