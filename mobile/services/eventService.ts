import api from './api';
import { Event, APIResponse } from '../types';

export const getEventsApi = async (search?: string, category?: string): Promise<Event[]> => {
  const params: Record<string, string> = {};
  if (search) params.search = search;
  if (category && category !== 'All') params.category = category;

  const response = await api.get<APIResponse<Event[]>>('/events', { params });
  return response.data.data || [];
};

export const getEventByIdApi = async (id: string): Promise<Event> => {
  const response = await api.get<APIResponse<Event>>(`/events/${id}`);
  return response.data.data!;
};
