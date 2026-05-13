import api from './client';
import { CheckIn1, CheckIn2 } from '../types';

export const checkinApi = {
  submitCheckIn1: (data: { techStack: string; workflow: string; approach: string }) =>
    api.post<CheckIn1>('/checkin/1', data).then((r) => r.data),

  getCheckIn1: (teamId: string) =>
    api.get<CheckIn1>(`/checkin/1/${teamId}`).then((r) => r.data),

  submitCheckIn2: (data: { githubLink: string; workflowStatus: string; progressUpdate: string }) =>
    api.post<CheckIn2>('/checkin/2', data).then((r) => r.data),

  getCheckIn2: (teamId: string) =>
    api.get<CheckIn2>(`/checkin/2/${teamId}`).then((r) => r.data),
};
