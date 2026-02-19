import { Router } from 'express';
import {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    getUsersByRole,
    changePassword,
    suspendUser,
    restoreUser,
    adminDeleteUser,

    createUser,
} from '../controllers/usersController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Routes
router.post('/', authenticate, authorize('ADMIN'), createUser);
router.get('/', authenticate, authorize('ADMIN'), getAllUsers);
router.get('/role/:role', authenticate, authorize('ADMIN'), getUsersByRole);
router.get('/:userId', authenticate, getUserById);
router.put('/:userId', authenticate, updateUser);
router.delete('/:userId', authenticate, authorize('ADMIN'), deleteUser);
router.post('/:userId/change-password', authenticate, changePassword);

// Admin endpoints
router.post('/:userId/suspend', authenticate, authorize('ADMIN'), suspendUser);
router.post('/:userId/restore', authenticate, authorize('ADMIN'), restoreUser);
router.post('/:userId/delete', authenticate, authorize('ADMIN'), adminDeleteUser);

export default router;
