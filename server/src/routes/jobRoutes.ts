import { Router } from 'express';
import {
  createJobDescription,
  getJobDescriptions,
  getJobDescriptionById,
  matchResumeWithJobHandler,
} from '../controllers/jobController.js';
import { authenticate } from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.use(authenticate);

router.get('/', getJobDescriptions);
router.post('/', createJobDescription);
router.get('/:id', getJobDescriptionById);
router.post('/:jobId/match/:resumeId', aiLimiter, matchResumeWithJobHandler);

export default router;
