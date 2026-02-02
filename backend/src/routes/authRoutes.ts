import { Router } from 'express';
import { register, login, getRegistrationConfig } from '../controllers/authController';

const router = Router();

router.get('/config', getRegistrationConfig);
router.post('/register', register);
router.post('/login', login);

export default router;
