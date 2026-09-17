import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import eventRoutes from './routes/event.routes';
import bookingRoutes from './routes/booking.routes';
import organizerRoutes from './routes/organizer.routes';
import { errorHandler } from './middleware/error.middleware';

const app = express();

app.use(cors());
app.use(express.json());

// Base API route
app.get('/api', (req, res) => {
  res.json({ success: true, message: 'EventHub REST API is running' });
});

// Domain Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/organizer', organizerRoutes);

// Error Handling Middleware
app.use(errorHandler);

export default app;
