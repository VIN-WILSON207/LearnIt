import { Router } from 'express';
import { generateCertificate, getCertificates, adminIssueCertificate, getAllCertificates, downloadCertificate } from '../controllers/certificateController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.post('/generate', authenticate, generateCertificate);
router.get('/', authenticate, getCertificates);
router.get('/all', authenticate, authorize('ADMIN'), getAllCertificates);
router.post('/admin/issue', authenticate, authorize('ADMIN'), adminIssueCertificate);
router.get('/:id/download', authenticate, downloadCertificate);

export default router;