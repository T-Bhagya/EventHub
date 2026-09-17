export type Role = 'USER' | 'ORGANIZER';

export type BookingStatus = 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  title: string;
  imageUrl?: string | null;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  price: number;
  totalSeats: number;
  availableSeats: number;
  organizerId: string;
  organizer?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  bookingReference: string;
  userId: string;
  eventId: string;
  ticketQuantity: number;
  totalPrice: number;
  phone: string;
  note?: string | null;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
  event: Event;
  user?: User;
}

export interface APIResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string>;
}

export interface DashboardStats {
  totalEvents: number;
  upcomingEvents: number;
  totalBookings: number;
  totalTicketsBooked: number;
  recentEvents: Event[];
}

export interface EventBookingsSummary {
  event: {
    id: string;
    title: string;
    totalSeats: number;
    availableSeats: number;
  };
  summary: {
    totalConfirmedBookings: number;
    totalTicketsReserved: number;
    availableSeats: number;
  };
  bookings: Booking[];
}
