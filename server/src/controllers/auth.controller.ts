import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { hashPassword, comparePassword, generateToken } from '../utils/auth';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, phone, password, role } = req.body;

    // Validation
    const errors: Record<string, string> = {};
    if (!name || !name.trim()) errors.name = 'Full name is required.';
    if (!email || !email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Please enter a valid email address.';
    }
    if (!phone || !phone.trim()) errors.phone = 'Phone number is required.';
    if (!password || password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }
    const userRole = role === 'ORGANIZER' ? 'ORGANIZER' : 'USER';

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed.',
        errors,
      });
    }

    // Check existing email
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.',
        errors: { email: 'Email already registered.' },
      });
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        passwordHash,
        role: userRole,
      },
    });

    const token = generateToken({ userId: user.id, role: user.role });

    const { passwordHash: _, ...userWithoutPassword } = user;

    return res.status(201).json({
      success: true,
      message: 'Registration successful.',
      data: {
        user: userWithoutPassword,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const errors: Record<string, string> = {};
    if (!email || !email.trim()) errors.email = 'Email is required.';
    if (!password) errors.password = 'Password is required.';

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed.',
        errors,
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = generateToken({ userId: user.id, role: user.role });

    const { passwordHash: _, ...userWithoutPassword } = user;

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        user: userWithoutPassword,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};
