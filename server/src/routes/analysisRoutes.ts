import { Router } from 'express';
import {
  analyzeResumeById,
  getAnalysisByResumeId,
  improveSection,
  getAnalysisHistory,
} from '../controllers/analysisController.js';
import { authenticate } from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.use(authenticate);

router.post('/resumes/:id/analyze', aiLimiter, analyzeResumeById);
router.get('/resumes/:id/analysis', getAnalysisByResumeId);
router.post('/improve', aiLimiter, improveSection);
router.get('/history', getAnalysisHistory);

export default router;
