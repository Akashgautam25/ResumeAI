import { z } from 'zod';

export const createResumeSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  targetRole: z.string().optional(),
  templateId: z.enum(['ats-classic', 'modern', 'developer', 'minimal']).default('ats-classic'),
  structuredData: z.record(z.any()),
});

export const updateResumeSchema = z.object({
  title: z.string().max(100).optional(),
  targetRole: z.string().optional(),
  templateId: z.enum(['ats-classic', 'modern', 'developer', 'minimal']).optional(),
  structuredData: z.record(z.any()).optional(),
});

export const improveSectionSchema = z.object({
  type: z.enum(['summary', 'bullet', 'project', 'general']),
  originalText: z.string().min(3, 'Original text is too short'),
  context: z.string().optional(),
  goal: z.string().optional(),
});
