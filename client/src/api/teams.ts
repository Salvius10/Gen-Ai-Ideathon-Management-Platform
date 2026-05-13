import api from './client';
import { Team } from '../types';

export const teamsApi = {
  create: (data: { name: string; problemStatement: string; description: string }) =>
    api.post<Team>('/teams', data).then((r) => r.data),

  join: (code: string) =>
    api.post<Team>('/teams/join', { code }).then((r) => r.data),

  list: () => api.get<Team[]>('/teams').then((r) => r.data),

  getById: (id: string) => api.get<Team>(`/teams/${id}`).then((r) => r.data),
};
