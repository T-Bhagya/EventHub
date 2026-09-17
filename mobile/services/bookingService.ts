import api from './api';
import { Booking, APIResponse } from '../types';

export const createBookingApi = async (data: {
  eventId: string;
  ticketQuantity: number;
  phone: string;
  note?: string;
}): Promise<Booking> => {
  const response = await api.post<APIResponse<Booking>>('/bookings', data);
  return response.data.data!;
};

export const getMyBookingsApi = async (): Promise<Booking[]> => {
  const response = await api.get<APIResponse<Booking[]>>('/bookings/my');
  return response.data.data || [];
};

export const getBookingByIdApi = async (id: string): Promise<Booking> => {
  const response = await api.get<APIResponse<Booking>>(`/bookings/${id}`);
  return response.data.data!;
};

export const cancelBookingApi = async (id: string): Promise<Booking> => {
  const response = await api.patch<APIResponse<Booking>>(`/bookings/${id}/cancel`);
  return response.data.data!;
};
