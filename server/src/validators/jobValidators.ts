import { z } from 'zod';

export const createJobSchema = z.object({
  company: z.string().min(1, 'Company name is required').max(100),
  role: z.string().min(1, 'Job role / title is required').max(100),
  jobUrl: z.string().url('Invalid URL format').optional().or(z.literal('')),
  rawText: z.string().min(30, 'Job description must be at least 30 characters long'),
});

export const tailorResumeSchema = z.object({
  jobId: z.string().min(1, 'Job ID is required'),
});
