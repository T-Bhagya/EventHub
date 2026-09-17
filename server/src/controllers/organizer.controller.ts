import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';

const DEFAULT_EVENT_IMAGE =
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80';

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const organizerId = req.user?.userId;
    if (!organizerId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const todayStr = new Date().toISOString().split('T')[0];

    const events = await prisma.event.findMany({
      where: { organizerId },
      include: {
        bookings: {
          where: { status: 'CONFIRMED' },
        },
      },
    });

    const totalEvents = events.length;
    const upcomingEvents = events.filter((e) => e.date >= todayStr).length;

    let totalBookings = 0;
    let totalTicketsBooked = 0;

    events.forEach((e) => {
      totalBookings += e.bookings.length;
      e.bookings.forEach((b) => {
        totalTicketsBooked += b.ticketQuantity;
      });
    });

    const recentEvents = await prisma.event.findMany({
      where: { organizerId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    return res.status(200).json({
      success: true,
      data: {
        totalEvents,
        upcomingEvents,
        totalBookings,
        totalTicketsBooked,
        recentEvents,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getOrganizerEvents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const organizerId = req.user?.userId;
    if (!organizerId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const events = await prisma.event.findMany({
      where: { organizerId },
      orderBy: { date: 'asc' },
      include: {
        _count: {
          select: { bookings: true },
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: events,
    });
  } catch (error) {
    next(error);
  }
};

export const createEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const organizerId = req.user?.userId;
    if (!organizerId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { title, imageUrl, description, date, time, location, category, price, totalSeats } = req.body;

    const errors: Record<string, string> = {};
    if (!title || !title.trim()) errors.title = 'Event title is required.';
    if (!description || !description.trim()) errors.description = 'Description is required.';
    if (!date) {
      errors.date = 'Date is required.';
    } else {
      const todayStr = new Date().toISOString().split('T')[0];
      if (date < todayStr) {
        errors.date = 'Event date cannot be in the past.';
      }
    }
    if (!time || !time.trim()) errors.time = 'Time is required.';
    if (!location || !location.trim()) errors.location = 'Location is required.';
    if (!category || !category.trim()) errors.category = 'Category is required.';

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      errors.price = 'Price must be a non-negative number.';
    }

    const parsedSeats = parseInt(totalSeats, 10);
    if (isNaN(parsedSeats) || parsedSeats <= 0) {
      errors.totalSeats = 'Total seats must be greater than 0.';
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed.',
        errors,
      });
    }

    const finalImageUrl = imageUrl && imageUrl.trim() ? imageUrl.trim() : DEFAULT_EVENT_IMAGE;

    const event = await prisma.event.create({
      data: {
        title: title.trim(),
        imageUrl: finalImageUrl,
        description: description.trim(),
        date,
        time: time.trim(),
        location: location.trim(),
        category: category.trim(),
        price: parsedPrice,
        totalSeats: parsedSeats,
        availableSeats: parsedSeats,
        organizerId,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Event created successfully!',
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

export const getOrganizerEventById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const organizerId = req.user?.userId;
    const { id } = req.params;

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        bookings: {
          include: {
            user: { select: { id: true, name: true, email: true, phone: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    if (event.organizerId !== organizerId) {
      return res.status(403).json({ success: false, message: 'Access denied. You do not own this event.' });
    }

    return res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

export const updateEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const organizerId = req.user?.userId;
    const { id } = req.params;

    const existingEvent = await prisma.event.findUnique({
      where: { id },
      include: { bookings: { where: { status: 'CONFIRMED' } } },
    });

    if (!existingEvent) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    if (existingEvent.organizerId !== organizerId) {
      return res.status(403).json({ success: false, message: 'Access denied. You do not own this event.' });
    }

    const { title, imageUrl, description, date, time, location, category, price, totalSeats } = req.body;

    const errors: Record<string, string> = {};
    if (title !== undefined && !title.trim()) errors.title = 'Event title is required.';
    if (description !== undefined && !description.trim()) errors.description = 'Description is required.';
    if (date !== undefined) {
      const todayStr = new Date().toISOString().split('T')[0];
      if (date < todayStr) {
        errors.date = 'Event date cannot be in the past.';
      }
    }
    if (time !== undefined && !time.trim()) errors.time = 'Time is required.';
    if (location !== undefined && !location.trim()) errors.location = 'Location is required.';
    if (category !== undefined && !category.trim()) errors.category = 'Category is required.';

    let parsedPrice = existingEvent.price;
    if (price !== undefined) {
      parsedPrice = parseFloat(price);
      if (isNaN(parsedPrice) || parsedPrice < 0) {
        errors.price = 'Price must be a non-negative number.';
      }
    }

    let parsedSeats = existingEvent.totalSeats;
    let newAvailableSeats = existingEvent.availableSeats;

    if (totalSeats !== undefined) {
      parsedSeats = parseInt(totalSeats, 10);
      if (isNaN(parsedSeats) || parsedSeats <= 0) {
        errors.totalSeats = 'Total seats must be greater than 0.';
      } else {
        // Calculate currently booked tickets
        const activeBookedTickets = existingEvent.bookings.reduce(
          (sum, b) => sum + b.ticketQuantity,
          0
        );

        if (parsedSeats < activeBookedTickets) {
          errors.totalSeats = `Total seats cannot be reduced to ${parsedSeats} because ${activeBookedTickets} ticket(s) are already booked.`;
        } else {
          // Adjust availableSeats based on new totalSeats difference
          const seatDiff = parsedSeats - existingEvent.totalSeats;
          newAvailableSeats = existingEvent.availableSeats + seatDiff;
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed.',
        errors,
      });
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(imageUrl !== undefined && { imageUrl: imageUrl.trim() || DEFAULT_EVENT_IMAGE }),
        ...(description !== undefined && { description: description.trim() }),
        ...(date !== undefined && { date }),
        ...(time !== undefined && { time: time.trim() }),
        ...(location !== undefined && { location: location.trim() }),
        ...(category !== undefined && { category: category.trim() }),
        ...(price !== undefined && { price: parsedPrice }),
        ...(totalSeats !== undefined && {
          totalSeats: parsedSeats,
          availableSeats: newAvailableSeats,
        }),
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Event updated successfully!',
      data: updatedEvent,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const organizerId = req.user?.userId;
    const { id } = req.params;

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        bookings: {
          where: { status: 'CONFIRMED' },
        },
      },
    });

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    if (event.organizerId !== organizerId) {
      return res.status(403).json({ success: false, message: 'Access denied. You do not own this event.' });
    }

    // Safety rule requirement 24:
    // If deleting events with active bookings creates unnecessary complexity, prevent deletion and return error.
    if (event.bookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'This event has active bookings and cannot be deleted.',
      });
    }

    await prisma.event.delete({ where: { id } });

    return res.status(200).json({
      success: true,
      message: 'Event deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const getEventBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const organizerId = req.user?.userId;
    const { id } = req.params;

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        bookings: {
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { id: true, name: true, email: true, phone: true } },
          },
        },
      },
    });

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    if (event.organizerId !== organizerId) {
      return res.status(403).json({ success: false, message: 'Access denied. You do not own this event.' });
    }

    const confirmedBookings = event.bookings.filter((b) => b.status === 'CONFIRMED');
    const totalConfirmedBookings = confirmedBookings.length;
    const totalTicketsReserved = confirmedBookings.reduce((sum, b) => sum + b.ticketQuantity, 0);

    return res.status(200).json({
      success: true,
      data: {
        event: {
          id: event.id,
          title: event.title,
          totalSeats: event.totalSeats,
          availableSeats: event.availableSeats,
        },
        summary: {
          totalConfirmedBookings,
          totalTicketsReserved,
          availableSeats: event.availableSeats,
        },
        bookings: event.bookings,
      },
    });
  } catch (error) {
    next(error);
  }
};
