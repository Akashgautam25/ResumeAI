import api from '../api/client.js';
import { Resume, StructuredResume } from '../types/index.js';

export const resumeService = {
  async getResumes(): Promise<Resume[]> {
    const res = await api.get('/resumes');
    return res.data.data.resumes;
  },

  async getResumeById(id: string): Promise<Resume> {
    const res = await api.get(`/resumes/${id}`);
    return res.data.data.resume;
  },

  async uploadResume(file: File): Promise<{ resume: Resume; analysis: any }> {
    const formData = new FormData();
    formData.append('resume', file);

    const res = await api.post('/resumes/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data.data;
  },

  async createResume(data: {
    title: string;
    targetRole?: string;
    templateId?: string;
    structuredData: StructuredResume;
  }): Promise<Resume> {
    const res = await api.post('/resumes', data);
    return res.data.data.resume;
  },

  async updateResume(
    id: string,
    data: {
      title?: string;
      targetRole?: string;
      templateId?: string;
      structuredData?: StructuredResume;
    }
  ): Promise<Resume> {
    const res = await api.patch(`/resumes/${id}`, data);
    return res.data.data.resume;
  },

  async duplicateResume(id: string): Promise<Resume> {
    const res = await api.post(`/resumes/${id}/duplicate`);
    return res.data.data.resume;
  },

  async deleteResume(id: string): Promise<void> {
    await api.delete(`/resumes/${id}`);
  },
};
