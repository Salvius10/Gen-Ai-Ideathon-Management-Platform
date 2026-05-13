import api from './client';
import { Submission } from '../types';

export const submissionApi = {
  submit: (data: { githubLink: string; description: string }) =>
    api.post<Submission>('/submission', data).then((r) => r.data),

  getByTeam: (teamId: string) =>
    api.get<Submission>(`/submission/${teamId}`).then((r) => r.data),

  getAll: () => api.get<Submission[]>('/submission').then((r) => r.data),
};
