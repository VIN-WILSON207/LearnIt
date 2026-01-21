import { Router } from 'express';
import { generateCertificate, getCertificates } from '../controllers/certificateController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/generate', authenticate, generateCertificate);
router.get('/', authenticate, getCertificates);

export default router;