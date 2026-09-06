import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/index.js';
import { prisma } from '../services/db/prisma.js';
import { matchResumeWithJob } from '../services/ai/jobMatcher.js';
import { createJobSchema } from '../validators/jobValidators.js';

export async function createJobDescription(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const validated = createJobSchema.parse(req.body);

    const job = await prisma.jobDescription.create({
      data: {
        userId: req.user.id,
        company: validated.company,
        role: validated.role,
        jobUrl: validated.jobUrl || null,
        rawText: validated.rawText,
        parsedData: JSON.stringify({
          company: validated.company,
          role: validated.role,
        }),
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Job description saved successfully',
      data: { job },
    });
  } catch (error) {
    next(error);
  }
}

export async function getJobDescriptions(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const jobs = await prisma.jobDescription.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        jobMatches: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    const parsedJobs = jobs.map((j: any) => {
      let parsedData = {};
      try {
        parsedData = JSON.parse(j.parsedData);
      } catch {
        parsedData = {};
      }

      return {
        id: j.id,
        company: j.company,
        role: j.role,
        jobUrl: j.jobUrl,
        rawText: j.rawText,
        parsedData,
        latestMatch: j.jobMatches[0]
          ? {
              id: j.jobMatches[0].id,
              resumeId: j.jobMatches[0].resumeId,
              overallScore: j.jobMatches[0].overallScore,
              skillMatchScore: j.jobMatches[0].skillMatchScore,
              createdAt: j.jobMatches[0].createdAt,
            }
          : null,
        createdAt: j.createdAt,
      };
    });

    return res.status(200).json({
      success: true,
      data: { jobs: parsedJobs },
    });
  } catch (error) {
    next(error);
  }
}

export async function getJobDescriptionById(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const { id } = req.params;
    const job = await prisma.jobDescription.findFirst({
      where: { id, userId: req.user.id },
      include: {
        jobMatches: {
          orderBy: { createdAt: 'desc' },
          include: {
            resume: {
              select: {
                id: true,
                title: true,
                atsScore: true,
              },
            },
          },
        },
      },
    });

    if (!job) {
      return res.status(404).json({ success: false, error: 'Job description not found' });
    }

    let parsedData = {};
    try {
      parsedData = JSON.parse(job.parsedData);
    } catch {
      parsedData = {};
    }

    const matches = job.jobMatches.map((m: any) => ({
      id: m.id,
      resumeId: m.resumeId,
      resumeTitle: m.resume.title,
      overallScore: m.overallScore,
      skillMatchScore: m.skillMatchScore,
      expMatchScore: m.expMatchScore,
      eduMatchScore: m.eduMatchScore,
      keywordMatchScore: m.keywordMatchScore,
      matchedSkills: JSON.parse(m.matchedSkills),
      partialSkills: JSON.parse(m.partialSkills),
      missingSkills: JSON.parse(m.missingSkills),
      recommendations: JSON.parse(m.recommendations),
      tailoredDiffs: m.tailoredDiffs ? JSON.parse(m.tailoredDiffs) : [],
      createdAt: m.createdAt,
    }));

    return res.status(200).json({
      success: true,
      data: {
        job: {
          id: job.id,
          company: job.company,
          role: job.role,
          jobUrl: job.jobUrl,
          rawText: job.rawText,
          parsedData,
          matches,
          createdAt: job.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function matchResumeWithJobHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const { jobId, resumeId } = req.params;

    const job = await prisma.jobDescription.findFirst({
      where: { id: jobId, userId: req.user.id },
    });

    if (!job) return res.status(404).json({ success: false, error: 'Job description not found' });

    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId: req.user.id },
    });

    if (!resume) return res.status(404).json({ success: false, error: 'Resume not found' });

    const structuredData = JSON.parse(resume.structuredData);
    const rawResumeText = resume.rawText || JSON.stringify(structuredData);

    const matchResult = await matchResumeWithJob(
      structuredData,
      rawResumeText,
      job.rawText,
      req.user.id
    );

    // Save parsed job data back to job record
    await prisma.jobDescription.update({
      where: { id: job.id },
      data: {
        parsedData: JSON.stringify(matchResult.parsedJob),
      },
    });

    // Save JobMatch record
    const jobMatch = await prisma.jobMatch.create({
      data: {
        resumeId: resume.id,
        jobId: job.id,
        overallScore: matchResult.overallScore,
        skillMatchScore: matchResult.skillMatchScore,
        expMatchScore: matchResult.expMatchScore,
        eduMatchScore: matchResult.eduMatchScore,
        keywordMatchScore: matchResult.keywordMatchScore,
        matchedSkills: JSON.stringify(matchResult.matchedSkills),
        partialSkills: JSON.stringify(matchResult.partialSkills),
        missingSkills: JSON.stringify(matchResult.missingSkills),
        recommendations: JSON.stringify(matchResult.recommendations),
        tailoredDiffs: JSON.stringify(matchResult.tailoredDiffs),
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Job match calculated successfully',
      data: {
        match: {
          id: jobMatch.id,
          resumeId: resume.id,
          jobId: job.id,
          overallScore: matchResult.overallScore,
          skillMatchScore: matchResult.skillMatchScore,
          expMatchScore: matchResult.expMatchScore,
          eduMatchScore: matchResult.eduMatchScore,
          keywordMatchScore: matchResult.keywordMatchScore,
          matchedSkills: matchResult.matchedSkills,
          partialSkills: matchResult.partialSkills,
          missingSkills: matchResult.missingSkills,
          recommendations: matchResult.recommendations,
          tailoredDiffs: matchResult.tailoredDiffs,
          parsedJob: matchResult.parsedJob,
          createdAt: jobMatch.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}
