import api from '../api/client.js';
import { JobDescription, JobMatch } from '../types/index.js';

export const jobService = {
  async getJobs(): Promise<JobDescription[]> {
    const res = await api.get('/jobs');
    return res.data.data.jobs;
  },

  async getJobById(id: string): Promise<JobDescription> {
    const res = await api.get(`/jobs/${id}`);
    return res.data.data.job;
  },

  async createJob(data: {
    company: string;
    role: string;
    jobUrl?: string;
    rawText: string;
  }): Promise<JobDescription> {
    const res = await api.post('/jobs', data);
    return res.data.data.job;
  },

  async matchJobWithResume(jobId: string, resumeId: string): Promise<JobMatch> {
    const res = await api.post(`/jobs/${jobId}/match/${resumeId}`);
    return res.data.data.match;
  },
};
