import api from './client';
import { Evaluation, EvaluationResult } from '../types';

export const evaluationApi = {
  submit: (data: {
    teamId: string;
    technicality: number;
    wowFactor: number;
    creativity: number;
    useCase: number;
    comments?: string;
  }) => api.post<Evaluation>('/evaluation', data).then((r) => r.data),

  getResults: () => api.get<EvaluationResult[]>('/evaluation/results').then((r) => r.data),

  getMyEvaluations: () => api.get<Evaluation[]>('/evaluation/my').then((r) => r.data),

  getTeamEvaluations: (teamId: string) =>
    api.get<Evaluation[]>(`/evaluation/team/${teamId}`).then((r) => r.data),
};
