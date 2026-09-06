import { Router } from 'express';
import {
  createResumeVersion,
  getVersionsByResumeId,
  compareVersions,
} from '../controllers/versionController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.post('/resumes/:resumeId/versions', createResumeVersion);
router.get('/resumes/:resumeId/versions', getVersionsByResumeId);
router.get('/compare', compareVersions);

export default router;
