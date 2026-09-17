import { Router } from 'express';
import {
  getDashboardStats,
  getOrganizerEvents,
  createEvent,
  getOrganizerEventById,
  updateEvent,
  deleteEvent,
  getEventBookings,
} from '../controllers/organizer.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireOrganizer } from '../middleware/role.middleware';

const router = Router();

router.use(authenticateToken);
router.use(requireOrganizer);

router.get('/dashboard', getDashboardStats);
router.get('/events', getOrganizerEvents);
router.post('/events', createEvent);
router.get('/events/:id', getOrganizerEventById);
router.put('/events/:id', updateEvent);
router.delete('/events/:id', deleteEvent);
router.get('/events/:id/bookings', getEventBookings);

export default router;
