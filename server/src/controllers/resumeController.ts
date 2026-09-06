import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/index.js';
import { prisma } from '../services/db/prisma.js';
import { extractTextFromFile } from '../services/parser/documentParser.js';
import { parseResumeTextToStructured } from '../services/parser/sectionExtractor.js';
import { analyzeResume } from '../services/ai/resumeAnalyzer.js';
import { createResumeSchema, updateResumeSchema } from '../validators/resumeValidators.js';
import { storageService } from '../services/storage/storageService.js';
import fs from 'fs';

export async function uploadResumeFile(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No resume file uploaded. Please upload a PDF or DOCX file.' });
    }

    const file = req.file;
    const userId = req.user.id;

    // 1. Extract plain text from PDF/DOCX
    const rawText = await extractTextFromFile(file.path, file.mimetype);

    // 2. Parse into structured resume sections
    const structuredData = parseResumeTextToStructured(rawText);

    // 3. Run initial ATS analysis
    const analysisResult = await analyzeResume(structuredData, rawText, userId);

    // 4. Save file via storage provider
    const storedFile = await storageService.saveFile(file, userId);

    // 5. Save file record
    await prisma.file.create({
      data: {
        userId,
        fileName: file.originalname,
        fileType: file.mimetype.includes('pdf') ? 'pdf' : 'docx',
        fileSize: file.size,
        filePath: storedFile.path,
        storageProvider: 'local',
      },
    });

    // 6. Save Resume in DB
    const resumeTitle = structuredData.personal.name
      ? `${structuredData.personal.name}'s Resume`
      : `${file.originalname.replace(/\.[^/.]+$/, '')}`;

    const resume = await prisma.resume.create({
      data: {
        userId,
        title: resumeTitle,
        targetRole: structuredData.personal.title || 'Software Engineer',
        templateId: 'ats-classic',
        rawText,
        structuredData: JSON.stringify(structuredData),
        atsScore: analysisResult.atsScore,
        completenessScore: analysisResult.deterministicMetrics.contactCompleteness,
      },
    });

    // 7. Save initial ResumeVersion
    await prisma.resumeVersion.create({
      data: {
        resumeId: resume.id,
        versionNumber: 1,
        title: 'Initial Upload',
        templateId: 'ats-classic',
        structuredData: JSON.stringify(structuredData),
        atsScore: analysisResult.atsScore,
        changeSummary: 'Parsed from uploaded document',
      },
    });

    // 8. Save initial ResumeAnalysis
    const analysis = await prisma.resumeAnalysis.create({
      data: {
        resumeId: resume.id,
        atsScore: analysisResult.atsScore,
        categoryScores: JSON.stringify(analysisResult.categoryScores),
        strengths: JSON.stringify(analysisResult.strengths),
        weaknesses: JSON.stringify(analysisResult.weaknesses),
        improvements: JSON.stringify(analysisResult.improvements),
        keywordAnalysis: JSON.stringify(analysisResult.keywordAnalysis),
        deterministicMetrics: JSON.stringify(analysisResult.deterministicMetrics),
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Resume uploaded and analyzed successfully',
      data: {
        resume: {
          ...resume,
          structuredData,
        },
        analysis: {
          ...analysis,
          categoryScores: analysisResult.categoryScores,
          strengths: analysisResult.strengths,
          weaknesses: analysisResult.weaknesses,
          improvements: analysisResult.improvements,
          keywordAnalysis: analysisResult.keywordAnalysis,
          deterministicMetrics: analysisResult.deterministicMetrics,
        },
      },
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      try { fs.unlinkSync(req.file.path); } catch { /* ignore */ }
    }
    next(error);
  }
}

export async function createResume(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const validated = createResumeSchema.parse(req.body);
    const userId = req.user.id;

    const rawText = JSON.stringify(validated.structuredData);
    const analysisResult = await analyzeResume(validated.structuredData as any, rawText, userId);

    const resume = await prisma.resume.create({
      data: {
        userId,
        title: validated.title,
        targetRole: validated.targetRole || 'Software Engineer',
        templateId: validated.templateId || 'ats-classic',
        rawText,
        structuredData: JSON.stringify(validated.structuredData),
        atsScore: analysisResult.atsScore,
        completenessScore: analysisResult.deterministicMetrics.contactCompleteness,
      },
    });

    await prisma.resumeVersion.create({
      data: {
        resumeId: resume.id,
        versionNumber: 1,
        title: 'Initial Creation',
        templateId: validated.templateId || 'ats-classic',
        structuredData: JSON.stringify(validated.structuredData),
        atsScore: analysisResult.atsScore,
        changeSummary: 'Created via Resume Builder',
      },
    });

    await prisma.resumeAnalysis.create({
      data: {
        resumeId: resume.id,
        atsScore: analysisResult.atsScore,
        categoryScores: JSON.stringify(analysisResult.categoryScores),
        strengths: JSON.stringify(analysisResult.strengths),
        weaknesses: JSON.stringify(analysisResult.weaknesses),
        improvements: JSON.stringify(analysisResult.improvements),
        keywordAnalysis: JSON.stringify(analysisResult.keywordAnalysis),
        deterministicMetrics: JSON.stringify(analysisResult.deterministicMetrics),
      },
    });

    return res.status(201).json({
      success: true,
      data: {
        resume: {
          ...resume,
          structuredData: validated.structuredData,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getResumes(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const resumes = await prisma.resume.findMany({
      where: { userId: req.user.id },
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: {
          select: {
            versions: true,
            jobMatches: true,
            interviewSessions: true,
          },
        },
        analyses: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    const parsedResumes = resumes.map((r) => {
      let structuredData = null;
      try {
        structuredData = JSON.parse(r.structuredData);
      } catch {
        structuredData = null;
      }

      return {
        id: r.id,
        title: r.title,
        targetRole: r.targetRole,
        templateId: r.templateId,
        atsScore: r.atsScore,
        completenessScore: r.completenessScore,
        versionCount: r._count.versions,
        jobMatchCount: r._count.jobMatches,
        interviewCount: r._count.interviewSessions,
        lastAnalysisDate: r.analyses[0]?.createdAt || null,
        structuredData,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      };
    });

    return res.status(200).json({
      success: true,
      data: { resumes: parsedResumes },
    });
  } catch (error) {
    next(error);
  }
}

export async function getResumeById(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const { id } = req.params;
    const resume = await prisma.resume.findFirst({
      where: { id, userId: req.user.id },
      include: {
        versions: {
          orderBy: { versionNumber: 'desc' },
        },
        analyses: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!resume) {
      return res.status(404).json({ success: false, error: 'Resume not found' });
    }

    let structuredData = {};
    try {
      structuredData = JSON.parse(resume.structuredData);
    } catch {
      structuredData = {};
    }

    const latestAnalysis = resume.analyses[0]
      ? {
          id: resume.analyses[0].id,
          atsScore: resume.analyses[0].atsScore,
          categoryScores: JSON.parse(resume.analyses[0].categoryScores),
          strengths: JSON.parse(resume.analyses[0].strengths),
          weaknesses: JSON.parse(resume.analyses[0].weaknesses),
          improvements: JSON.parse(resume.analyses[0].improvements),
          keywordAnalysis: JSON.parse(resume.analyses[0].keywordAnalysis),
          deterministicMetrics: JSON.parse(resume.analyses[0].deterministicMetrics),
          createdAt: resume.analyses[0].createdAt,
        }
      : null;

    return res.status(200).json({
      success: true,
      data: {
        resume: {
          ...resume,
          structuredData,
          latestAnalysis,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateResume(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const { id } = req.params;
    const validated = updateResumeSchema.parse(req.body);

    const existing = await prisma.resume.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: 'Resume not found' });
    }

    const updatedData: any = {};
    if (validated.title) updatedData.title = validated.title;
    if (validated.targetRole) updatedData.targetRole = validated.targetRole;
    if (validated.templateId) updatedData.templateId = validated.templateId;

    if (validated.structuredData) {
      updatedData.structuredData = JSON.stringify(validated.structuredData);
      
      // Calculate updated deterministic ATS score
      const rawText = JSON.stringify(validated.structuredData);
      const analysisResult = await analyzeResume(validated.structuredData as any, rawText, req.user.id);
      updatedData.atsScore = analysisResult.atsScore;
      updatedData.completenessScore = analysisResult.deterministicMetrics.contactCompleteness;

      // Update or create analysis snapshot
      await prisma.resumeAnalysis.create({
        data: {
          resumeId: existing.id,
          atsScore: analysisResult.atsScore,
          categoryScores: JSON.stringify(analysisResult.categoryScores),
          strengths: JSON.stringify(analysisResult.strengths),
          weaknesses: JSON.stringify(analysisResult.weaknesses),
          improvements: JSON.stringify(analysisResult.improvements),
          keywordAnalysis: JSON.stringify(analysisResult.keywordAnalysis),
          deterministicMetrics: JSON.stringify(analysisResult.deterministicMetrics),
        },
      });
    }

    const updated = await prisma.resume.update({
      where: { id: existing.id },
      data: updatedData,
    });

    return res.status(200).json({
      success: true,
      message: 'Resume updated successfully',
      data: {
        resume: {
          ...updated,
          structuredData: validated.structuredData || JSON.parse(updated.structuredData),
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function duplicateResume(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const { id } = req.params;
    const existing = await prisma.resume.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: 'Resume not found' });
    }

    const duplicated = await prisma.resume.create({
      data: {
        userId: req.user.id,
        title: `${existing.title} (Copy)`,
        targetRole: existing.targetRole,
        templateId: existing.templateId,
        rawText: existing.rawText,
        structuredData: existing.structuredData,
        atsScore: existing.atsScore,
        completenessScore: existing.completenessScore,
        parentResumeId: existing.id,
      },
    });

    await prisma.resumeVersion.create({
      data: {
        resumeId: duplicated.id,
        versionNumber: 1,
        title: 'Cloned from original',
        templateId: existing.templateId,
        structuredData: existing.structuredData,
        atsScore: existing.atsScore,
        changeSummary: `Cloned from ${existing.title}`,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Resume duplicated successfully',
      data: {
        resume: {
          ...duplicated,
          structuredData: JSON.parse(duplicated.structuredData),
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteResume(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const { id } = req.params;
    const existing = await prisma.resume.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: 'Resume not found' });
    }

    await prisma.resume.delete({
      where: { id: existing.id },
    });

    return res.status(200).json({
      success: true,
      message: 'Resume deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}
