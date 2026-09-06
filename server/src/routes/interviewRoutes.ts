import { Router } from 'express';
import {
  generateInterview,
  getInterviewSessions,
  getInterviewSessionById,
  updateQuestionNotes,
} from '../controllers/interviewController.js';
import { authenticate } from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.use(authenticate);

router.post('/generate', aiLimiter, generateInterview);
router.get('/', getInterviewSessions);
router.get('/:id', getInterviewSessionById);
router.patch('/questions/:questionId', updateQuestionNotes);

export default router;
