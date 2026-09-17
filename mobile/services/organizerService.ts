import api from './api';
import { Event, Booking, DashboardStats, EventBookingsSummary, APIResponse } from '../types';

export const getDashboardStatsApi = async (): Promise<DashboardStats> => {
  const response = await api.get<APIResponse<DashboardStats>>('/organizer/dashboard');
  return response.data.data!;
};

export const getOrganizerEventsApi = async (): Promise<Event[]> => {
  const response = await api.get<APIResponse<Event[]>>('/organizer/events');
  return response.data.data || [];
};

export const createOrganizerEventApi = async (data: {
  title: string;
  imageUrl?: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  price: number;
  totalSeats: number;
}): Promise<Event> => {
  const response = await api.post<APIResponse<Event>>('/organizer/events', data);
  return response.data.data!;
};

export const getOrganizerEventByIdApi = async (id: string): Promise<Event> => {
  const response = await api.get<APIResponse<Event>>(`/organizer/events/${id}`);
  return response.data.data!;
};

export const updateOrganizerEventApi = async (
  id: string,
  data: Partial<{
    title: string;
    imageUrl: string;
    description: string;
    date: string;
    time: string;
    location: string;
    category: string;
    price: number;
    totalSeats: number;
  }>
): Promise<Event> => {
  const response = await api.put<APIResponse<Event>>(`/organizer/events/${id}`, data);
  return response.data.data!;
};

export const deleteOrganizerEventApi = async (id: string): Promise<void> => {
  await api.delete(`/organizer/events/${id}`);
};

export const getEventBookingsApi = async (id: string): Promise<EventBookingsSummary> => {
  const response = await api.get<APIResponse<EventBookingsSummary>>(`/organizer/events/${id}/bookings`);
  return response.data.data!;
};
