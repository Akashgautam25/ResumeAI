import { Router } from 'express';
import {
  uploadResumeFile,
  createResume,
  getResumes,
  getResumeById,
  updateResume,
  duplicateResume,
  deleteResume,
} from '../controllers/resumeController.js';
import { authenticate } from '../middleware/auth.js';
import { uploadResume } from '../middleware/upload.js';

const router = Router();

router.use(authenticate);

router.get('/', getResumes);
router.post('/upload', uploadResume.single('resume'), uploadResumeFile);
router.post('/', createResume);
router.get('/:id', getResumeById);
router.patch('/:id', updateResume);
router.post('/:id/duplicate', duplicateResume);
router.delete('/:id', deleteResume);

export default router;
