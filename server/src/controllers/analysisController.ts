import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/index.js';
import { prisma } from '../services/db/prisma.js';
import { analyzeResume } from '../services/ai/resumeAnalyzer.js';
import { improveResumeSection } from '../services/ai/resumeImprover.js';
import { improveSectionSchema } from '../validators/resumeValidators.js';

export async function analyzeResumeById(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const { id } = req.params;
    const resume = await prisma.resume.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!resume) {
      return res.status(404).json({ success: false, error: 'Resume not found' });
    }

    const structuredData = JSON.parse(resume.structuredData);
    const rawText = resume.rawText || JSON.stringify(structuredData);

    const result = await analyzeResume(structuredData, rawText, req.user.id);

    const analysis = await prisma.resumeAnalysis.create({
      data: {
        resumeId: resume.id,
        atsScore: result.atsScore,
        categoryScores: JSON.stringify(result.categoryScores),
        strengths: JSON.stringify(result.strengths),
        weaknesses: JSON.stringify(result.weaknesses),
        improvements: JSON.stringify(result.improvements),
        keywordAnalysis: JSON.stringify(result.keywordAnalysis),
        deterministicMetrics: JSON.stringify(result.deterministicMetrics),
      },
    });

    await prisma.resume.update({
      where: { id: resume.id },
      data: {
        atsScore: result.atsScore,
        completenessScore: result.deterministicMetrics.contactCompleteness,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Analysis completed successfully',
      data: {
        analysis: {
          id: analysis.id,
          resumeId: resume.id,
          atsScore: result.atsScore,
          categoryScores: result.categoryScores,
          strengths: result.strengths,
          weaknesses: result.weaknesses,
          improvements: result.improvements,
          keywordAnalysis: result.keywordAnalysis,
          deterministicMetrics: result.deterministicMetrics,
          createdAt: analysis.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getAnalysisByResumeId(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const { id } = req.params;
    const resume = await prisma.resume.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!resume) {
      return res.status(404).json({ success: false, error: 'Resume not found' });
    }

    const latest = await prisma.resumeAnalysis.findFirst({
      where: { resumeId: id },
      orderBy: { createdAt: 'desc' },
    });

    if (!latest) {
      return res.status(404).json({ success: false, error: 'No analysis found for this resume' });
    }

    return res.status(200).json({
      success: true,
      data: {
        analysis: {
          id: latest.id,
          resumeId: latest.resumeId,
          atsScore: latest.atsScore,
          categoryScores: JSON.parse(latest.categoryScores),
          strengths: JSON.parse(latest.strengths),
          weaknesses: JSON.parse(latest.weaknesses),
          improvements: JSON.parse(latest.improvements),
          keywordAnalysis: JSON.parse(latest.keywordAnalysis),
          deterministicMetrics: JSON.parse(latest.deterministicMetrics),
          createdAt: latest.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function improveSection(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const validated = improveSectionSchema.parse(req.body);

    const result = await improveResumeSection(
      validated.type,
      validated.originalText,
      validated.context,
      validated.goal,
      req.user.id
    );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAnalysisHistory(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const analyses = await prisma.resumeAnalysis.findMany({
      where: {
        resume: {
          userId: req.user.id,
        },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        resume: {
          select: {
            id: true,
            title: true,
            targetRole: true,
          },
        },
      },
      take: 50,
    });

    const parsedAnalyses = analyses.map((a: any) => {
      let catScores = {};
      try {
        catScores = JSON.parse(a.categoryScores);
      } catch {
        catScores = {};
      }

      return {
        id: a.id,
        resumeId: a.resumeId,
        resumeTitle: a.resume.title,
        targetRole: a.resume.targetRole,
        atsScore: a.atsScore,
        categoryScores: catScores,
        createdAt: a.createdAt,
      };
    });

    return res.status(200).json({
      success: true,
      data: { history: parsedAnalyses },
    });
  } catch (error) {
    next(error);
  }
}
