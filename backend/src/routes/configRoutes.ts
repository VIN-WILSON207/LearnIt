import { Router } from 'express';
import {
    getAppConfig,
    getLevels,
    getSubjects,
    getSubjectsByLevel,
    getHealthStatus,
    updateSettings,
} from '../controllers/configController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', getAppConfig);
router.post('/settings', authenticate, authorize('ADMIN'), updateSettings);
router.get('/health', getHealthStatus);
router.get('/levels', getLevels);
router.get('/subjects', getSubjects);
router.get('/subjects/:levelId', getSubjectsByLevel);

export default router;
