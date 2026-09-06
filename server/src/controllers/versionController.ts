import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/index.js';
import { prisma } from '../services/db/prisma.js';

export async function createResumeVersion(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const { resumeId } = req.params;
    const { title, changeSummary } = req.body;

    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId: req.user.id },
      include: {
        versions: {
          orderBy: { versionNumber: 'desc' },
          take: 1,
        },
      },
    });

    if (!resume) return res.status(404).json({ success: false, error: 'Resume not found' });

    const nextVersionNum = (resume.versions[0]?.versionNumber || 0) + 1;

    const version = await prisma.resumeVersion.create({
      data: {
        resumeId: resume.id,
        versionNumber: nextVersionNum,
        title: title || `Version ${nextVersionNum}`,
        templateId: resume.templateId,
        structuredData: resume.structuredData,
        atsScore: resume.atsScore,
        changeSummary: changeSummary || 'Manual snapshot created',
      },
    });

    return res.status(201).json({
      success: true,
      message: `Version ${nextVersionNum} created successfully`,
      data: { version },
    });
  } catch (error) {
    next(error);
  }
}

export async function getVersionsByResumeId(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const { resumeId } = req.params;

    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId: req.user.id },
    });

    if (!resume) return res.status(404).json({ success: false, error: 'Resume not found' });

    const versions = await prisma.resumeVersion.findMany({
      where: { resumeId },
      orderBy: { versionNumber: 'desc' },
    });

    const parsedVersions = versions.map((v: any) => ({
      ...v,
      structuredData: JSON.parse(v.structuredData),
    }));

    return res.status(200).json({
      success: true,
      data: { versions: parsedVersions },
    });
  } catch (error) {
    next(error);
  }
}

export async function compareVersions(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const { versionAId, versionBId } = req.query;

    if (!versionAId || !versionBId) {
      return res.status(400).json({ success: false, error: 'Both versionAId and versionBId are required' });
    }

    const versionA = await prisma.resumeVersion.findUnique({
      where: { id: String(versionAId) },
      include: { resume: true },
    });

    const versionB = await prisma.resumeVersion.findUnique({
      where: { id: String(versionBId) },
      include: { resume: true },
    });

    if (!versionA || !versionB || versionA.resume.userId !== req.user.id || versionB.resume.userId !== req.user.id) {
      return res.status(404).json({ success: false, error: 'One or both versions not found or unauthorized' });
    }

    const structA = JSON.parse(versionA.structuredData);
    const structB = JSON.parse(versionB.structuredData);

    const scoreDelta = versionB.atsScore - versionA.atsScore;

    const changes = [
      {
        field: 'ATS Score',
        versionA: `${versionA.atsScore}/100`,
        versionB: `${versionB.atsScore}/100`,
        improvement: scoreDelta >= 0 ? `+${scoreDelta}` : `${scoreDelta}`,
      },
      {
        field: 'Summary',
        versionA: structA.summary ? `${structA.summary.slice(0, 100)}...` : '(Empty)',
        versionB: structB.summary ? `${structB.summary.slice(0, 100)}...` : '(Empty)',
        status: structA.summary !== structB.summary ? 'Modified' : 'Unchanged',
      },
      {
        field: 'Technical Skills Count',
        versionA: `${structA.skills?.technical?.length || 0} skills`,
        versionB: `${structB.skills?.technical?.length || 0} skills`,
        status: (structB.skills?.technical?.length || 0) - (structA.skills?.technical?.length || 0) >= 0 ? 'Expanded' : 'Reduced',
      },
      {
        field: 'Projects Count',
        versionA: `${structA.projects?.length || 0} projects`,
        versionB: `${structB.projects?.length || 0} projects`,
        status: (structB.projects?.length || 0) - (structA.projects?.length || 0) >= 0 ? 'Expanded' : 'Reduced',
      },
      {
        field: 'Experience Count',
        versionA: `${structA.experience?.length || 0} roles`,
        versionB: `${structB.experience?.length || 0} roles`,
        status: (structB.experience?.length || 0) - (structA.experience?.length || 0) >= 0 ? 'Expanded' : 'Reduced',
      },
    ];

    return res.status(200).json({
      success: true,
      data: {
        comparison: {
          versionA: {
            id: versionA.id,
            versionNumber: versionA.versionNumber,
            title: versionA.title,
            atsScore: versionA.atsScore,
            structuredData: structA,
            createdAt: versionA.createdAt,
          },
          versionB: {
            id: versionB.id,
            versionNumber: versionB.versionNumber,
            title: versionB.title,
            atsScore: versionB.atsScore,
            structuredData: structB,
            createdAt: versionB.createdAt,
          },
          scoreDelta,
          changes,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}
