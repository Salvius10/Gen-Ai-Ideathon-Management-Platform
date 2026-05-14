import api from './client';
import { AdminStats, EventConfig, Team, User } from '../types';

export const adminApi = {
  getStats: () => api.get<AdminStats>('/admin/stats').then((r) => r.data),

  getUsers: () => api.get<User[]>('/admin/users').then((r) => r.data),

  updateRole: (userId: string, role: string) =>
    api.patch<User>(`/admin/users/${userId}/role`, { role }).then((r) => r.data),

  deleteUser: (userId: string) => api.delete(`/admin/users/${userId}`),

  getTeams: () => api.get<Team[]>('/admin/teams').then((r) => r.data),

  deleteTeam: (teamId: string) => api.delete(`/admin/teams/${teamId}`),

  getMentors: () => api.get<User[]>('/mentors').then((r) => r.data),

  assignMentor: (teamId: string, mentorId: string) =>
    api.post<Team>('/mentors/assign', { teamId, mentorId }).then((r) => r.data),

  getEvents: () => api.get<EventConfig[]>('/admin/events').then((r) => r.data),

  toggleEvent: (event: string, isOpen: boolean) =>
    api.patch<EventConfig>(`/admin/events/${event}`, { isOpen }).then((r) => r.data),
};
