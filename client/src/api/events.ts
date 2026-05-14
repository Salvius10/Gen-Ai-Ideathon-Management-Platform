import api from './client';
import { EventConfig } from '../types';

export const eventsApi = {
  getAll: () => api.get<EventConfig[]>('/events').then((r) => r.data),
};
