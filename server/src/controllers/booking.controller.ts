import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';

// Helper function to generate unique booking reference
const generateBookingReference = (): string => {
  const randomChars = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `EVH-${randomChars}`;
};

export const createBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { eventId, ticketQuantity, phone, note } = req.body;

    // Validation
    const qty = parseInt(ticketQuantity, 10);
    if (!eventId) {
      return res.status(400).json({ success: false, message: 'Event ID is required.' });
    }
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({ success: false, message: 'Ticket quantity must be at least 1.' });
    }
    if (!phone || !phone.trim()) {
      return res.status(400).json({ success: false, message: 'Phone number is required.' });
    }

    // Find event
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    // Check event date
    const todayStr = new Date().toISOString().split('T')[0];
    if (event.date < todayStr) {
      return res.status(400).json({
        success: false,
        message: 'Cannot book tickets for an event that has already passed.',
      });
    }

    // Check available seats
    if (event.availableSeats < qty) {
      return res.status(400).json({
        success: false,
        message: `Only ${event.availableSeats} seat(s) remaining for this event.`,
      });
    }

    // Backend calculates total price
    const totalPrice = event.price * qty;

    // Generate unique booking reference
    let bookingReference = generateBookingReference();
    let isUnique = false;
    let attempts = 0;
    while (!isUnique && attempts < 5) {
      const existing = await prisma.booking.findUnique({ where: { bookingReference } });
      if (!existing) {
        isUnique = true;
      } else {
        bookingReference = generateBookingReference();
        attempts++;
      }
    }

    // Execute atomic transaction
    const [booking, updatedEvent] = await prisma.$transaction([
      prisma.booking.create({
        data: {
          bookingReference,
          userId,
          eventId,
          ticketQuantity: qty,
          totalPrice,
          phone: phone.trim(),
          note: note ? note.trim() : null,
          status: 'CONFIRMED',
        },
        include: {
          event: true,
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      prisma.event.update({
        where: { id: eventId },
        data: {
          availableSeats: {
            decrement: qty,
          },
        },
      }),
    ]);

    return res.status(201).json({
      success: true,
      message: 'Booking confirmed successfully!',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Fetch user bookings
    const bookings = await prisma.booking.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        event: {
          include: {
            organizer: {
              select: { name: true, email: true },
            },
          },
        },
      },
    });

    const todayStr = new Date().toISOString().split('T')[0];

    // Check for any bookings whose event date has passed and auto-complete them
    const updatedBookings = await Promise.all(
      bookings.map(async (b) => {
        if (b.status === 'CONFIRMED' && b.event.date < todayStr) {
          const updated = await prisma.booking.update({
            where: { id: b.id },
            data: { status: 'COMPLETED' },
            include: {
              event: {
                include: {
                  organizer: { select: { name: true, email: true } },
                },
              },
            },
          });
          return updated;
        }
        return b;
      })
    );

    return res.status(200).json({
      success: true,
      data: updatedBookings,
    });
  } catch (error) {
    next(error);
  }
};

export const getBookingById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        event: {
          include: {
            organizer: { select: { name: true, email: true, phone: true } },
          },
        },
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    // Check authorization: must be the user who booked or the organizer of the event
    if (booking.userId !== userId && booking.event.organizerId !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    return res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { event: true },
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (booking.userId !== userId) {
      return res.status(403).json({ success: false, message: 'You can only cancel your own bookings.' });
    }

    if (booking.status === 'CANCELLED') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled.' });
    }

    if (booking.status === 'COMPLETED') {
      return res.status(400).json({ success: false, message: 'Past or completed bookings cannot be cancelled.' });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    if (booking.event.date < todayStr) {
      return res.status(400).json({ success: false, message: 'Past events cannot be cancelled.' });
    }

    // Execute cancellation in Prisma transaction: set status CANCELLED, increment availableSeats
    const [updatedBooking] = await prisma.$transaction([
      prisma.booking.update({
        where: { id: booking.id },
        data: { status: 'CANCELLED' },
        include: { event: true },
      }),
      prisma.event.update({
        where: { id: booking.eventId },
        data: {
          availableSeats: {
            increment: booking.ticketQuantity,
          },
        },
      }),
    ]);

    return res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully. Seats have been restored.',
      data: updatedBooking,
    });
  } catch (error) {
    next(error);
  }
};
