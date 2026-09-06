import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/index.js';
import { prisma } from '../services/db/prisma.js';
import { generateInterviewQuestions } from '../services/ai/interviewGenerator.js';

export async function generateInterview(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const { resumeId, jobId } = req.body;

    if (!resumeId) {
      return res.status(400).json({ success: false, error: 'Resume ID is required to generate interview questions' });
    }

    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId: req.user.id },
    });

    if (!resume) {
      return res.status(404).json({ success: false, error: 'Resume not found' });
    }

    let job = null;
    if (jobId) {
      job = await prisma.jobDescription.findFirst({
        where: { id: jobId, userId: req.user.id },
      });
    }

    const structuredData = JSON.parse(resume.structuredData);
    const rawResumeText = resume.rawText || JSON.stringify(structuredData);
    const rawJobText = job ? job.rawText : undefined;

    const interviewData = await generateInterviewQuestions(
      structuredData,
      rawResumeText,
      rawJobText,
      req.user.id
    );

    const session = await prisma.interviewSession.create({
      data: {
        resumeId: resume.id,
        jobId: job ? job.id : null,
        readinessScore: interviewData.readinessScore,
        categoryScores: JSON.stringify(interviewData.categoryScores),
        targetRole: job ? job.role : resume.targetRole || 'Software Engineer',
        targetCompany: job ? job.company : undefined,
        questions: {
          create: interviewData.questions.map((q, idx) => ({
            category: q.category,
            question: q.question,
            difficulty: q.difficulty,
            whyItMatters: q.whyItMatters,
            suggestedAnswerFramework: q.suggestedAnswerFramework,
            sampleAnswer: q.sampleAnswer,
            order: idx + 1,
          })),
        },
      },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Interview preparation questions generated successfully',
      data: {
        session: {
          ...session,
          categoryScores: interviewData.categoryScores,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getInterviewSessions(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const sessions = await prisma.interviewSession.findMany({
      where: {
        resume: {
          userId: req.user.id,
        },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        resume: {
          select: { id: true, title: true },
        },
        job: {
          select: { id: true, company: true, role: true },
        },
        _count: {
          select: { questions: true },
        },
      },
    });

    const parsedSessions = sessions.map((s: any) => {
      let categoryScores = {};
      try {
        categoryScores = JSON.parse(s.categoryScores);
      } catch {
        categoryScores = {};
      }

      return {
        id: s.id,
        resumeId: s.resumeId,
        resumeTitle: s.resume.title,
        jobId: s.jobId,
        targetRole: s.targetRole,
        targetCompany: s.targetCompany,
        readinessScore: s.readinessScore,
        categoryScores,
        questionCount: s._count.questions,
        createdAt: s.createdAt,
      };
    });

    return res.status(200).json({
      success: true,
      data: { sessions: parsedSessions },
    });
  } catch (error) {
    next(error);
  }
}

export async function getInterviewSessionById(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const { id } = req.params;
    const session = await prisma.interviewSession.findFirst({
      where: {
        id,
        resume: {
          userId: req.user.id,
        },
      },
      include: {
        resume: {
          select: { id: true, title: true },
        },
        job: {
          select: { id: true, company: true, role: true },
        },
        questions: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!session) {
      return res.status(404).json({ success: false, error: 'Interview session not found' });
    }

    return res.status(200).json({
      success: true,
      data: {
        session: {
          ...session,
          categoryScores: JSON.parse(session.categoryScores),
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateQuestionNotes(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const { questionId } = req.params;
    const { userNotes } = req.body;

    const question = await prisma.interviewQuestion.findFirst({
      where: {
        id: questionId,
        session: {
          resume: {
            userId: req.user.id,
          },
        },
      },
    });

    if (!question) {
      return res.status(404).json({ success: false, error: 'Question not found' });
    }

    const updated = await prisma.interviewQuestion.update({
      where: { id: question.id },
      data: { userNotes },
    });

    return res.status(200).json({
      success: true,
      data: { question: updated },
    });
  } catch (error) {
    next(error);
  }
}
