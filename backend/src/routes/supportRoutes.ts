import { Router } from 'express';
import { createTicket, getUserTickets, getAllTickets, updateTicketStatus } from '../controllers/supportController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, createTicket);
router.get('/my', authenticate, getUserTickets);
router.get('/', authenticate, authorize('ADMIN'), getAllTickets);
router.put('/status', authenticate, authorize('ADMIN'), updateTicketStatus);

export default router;