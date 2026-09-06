import api from '../api/client.js';
import { ResumeAnalysis } from '../types/index.js';

export interface ImprovementResponse {
  improved: string;
  reason: string;
  variations: Array<{
    text: string;
    style: string;
    note: string;
  }>;
  actionVerbsUsed: string[];
}

export const analysisService = {
  async analyzeResume(resumeId: string): Promise<ResumeAnalysis> {
    const res = await api.post(`/resumes/${resumeId}/analyze`);
    return res.data.data.analysis;
  },

  async getAnalysis(resumeId: string): Promise<ResumeAnalysis> {
    const res = await api.get(`/resumes/${resumeId}/analysis`);
    return res.data.data.analysis;
  },

  async improveSection(data: {
    type: 'summary' | 'bullet' | 'project' | 'general';
    originalText: string;
    context?: string;
    goal?: string;
  }): Promise<ImprovementResponse> {
    const res = await api.post('/improve', data);
    return res.data.data;
  },

  async getHistory(): Promise<any[]> {
    const res = await api.get('/history');
    return res.data.data.history;
  },
};
