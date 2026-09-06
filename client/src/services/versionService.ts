import api from '../api/client.js';
import { ResumeVersion } from '../types/index.js';

export interface ComparisonResult {
  versionA: {
    id: string;
    versionNumber: number;
    title: string;
    atsScore: number;
    structuredData: any;
    createdAt: string;
  };
  versionB: {
    id: string;
    versionNumber: number;
    title: string;
    atsScore: number;
    structuredData: any;
    createdAt: string;
  };
  scoreDelta: number;
  changes: Array<{
    field: string;
    versionA: string;
    versionB: string;
    improvement?: string;
    status?: string;
  }>;
}

export const versionService = {
  async getVersions(resumeId: string): Promise<ResumeVersion[]> {
    const res = await api.get(`/resumes/${resumeId}/versions`);
    return res.data.data.versions;
  },

  async createVersion(
    resumeId: string,
    data: { title?: string; changeSummary?: string }
  ): Promise<ResumeVersion> {
    const res = await api.post(`/resumes/${resumeId}/versions`, data);
    return res.data.data.version;
  },

  async compareVersions(versionAId: string, versionBId: string): Promise<ComparisonResult> {
    const res = await api.get(`/compare?versionAId=${versionAId}&versionBId=${versionBId}`);
    return res.data.data.comparison;
  },
};
