import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';

export const getEvents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, category } = req.query;

    const where: any = {};

    if (category && typeof category === 'string' && category.trim() !== 'All' && category.trim() !== '') {
      where.category = {
        equals: category.trim(),
      };
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      const searchTerm = search.trim();
      where.OR = [
        { title: { contains: searchTerm } },
        { description: { contains: searchTerm } },
        { location: { contains: searchTerm } },
        { category: { contains: searchTerm } },
      ];
    }

    const events = await prisma.event.findMany({
      where,
      orderBy: {
        date: 'asc',
      },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
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

export const getEventById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    next(error);
  }
};
