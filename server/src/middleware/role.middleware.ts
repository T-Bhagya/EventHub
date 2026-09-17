import { Request, Response, NextFunction } from 'express';

export const requireOrganizer = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.',
    });
  }

  if (req.user.role !== 'ORGANIZER') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Organizer role required.',
    });
  }

  next();
};
