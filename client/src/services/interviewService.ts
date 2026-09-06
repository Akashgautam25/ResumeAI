import api from '../api/client.js';
import { InterviewSession, InterviewQuestion } from '../types/index.js';

export const interviewService = {
  async generateInterview(data: { resumeId: string; jobId?: string }): Promise<InterviewSession> {
    const res = await api.post('/interviews/generate', data);
    return res.data.data.session;
  },

  async getSessions(): Promise<InterviewSession[]> {
    const res = await api.get('/interviews');
    return res.data.data.sessions;
  },

  async getSessionById(id: string): Promise<InterviewSession> {
    const res = await api.get(`/interviews/${id}`);
    return res.data.data.session;
  },

  async updateNotes(questionId: string, userNotes: string): Promise<InterviewQuestion> {
    const res = await api.patch(`/interviews/questions/${questionId}`, { userNotes });
    return res.data.data.question;
  },
};
