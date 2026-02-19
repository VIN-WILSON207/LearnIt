import { Router } from 'express';
import { register, login, getRegistrationConfig, forgotPassword, resetPassword } from '../controllers/authController';

const router = Router();

router.get('/config', getRegistrationConfig);
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
