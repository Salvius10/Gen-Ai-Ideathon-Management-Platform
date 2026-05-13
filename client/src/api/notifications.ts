import api from './client';
import { Notification } from '../types';

export const notificationsApi = {
  getAll: () => api.get<Notification[]>('/notifications').then((r) => r.data),

  markRead: (id: string) => api.patch(`/notifications/${id}/read`),

  markAllRead: () => api.patch('/notifications/read-all'),
};
