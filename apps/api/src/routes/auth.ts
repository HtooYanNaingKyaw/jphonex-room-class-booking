import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';

export const authRouter = Router();

// Register new user
authRouter.post('/register', async (req, res) => {
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().min(2),
    phone: z.string().optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
    dob: z.string().datetime().optional(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());

  try {
    const { email, password, name, phone, gender, dob } = parsed.data;
    
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone }].filter(Boolean) }
    });
    
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);
    
    // Create user with default role (assuming role_id 3 is for regular users)
    const user = await prisma.user.create({
      data: {
        email,
        password_hash: passwordHash,
        name,
        phone,
        gender,
        dob: dob ? new Date(dob) : null,
        role_id: 3, // Default user role
      },
      include: {
        role: true,
      },
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id.toString(), email: user.email, role: user.role.name },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    res.json({
      user: {
        id: user.id.toString(),
        email: user.email,
        name: user.name,
        role: user.role.name,
        points_balance: user.points_balance,
      },
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login
authRouter.post('/login', async (req, res) => {
  const schema = z.object({
    email: z.string().email(),
    password: z.string(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());

  try {
    const { email, password } = parsed.data;
    
    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ message: 'Account is not active' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id.toString(), email: user.email, role: user.role.name },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    res.json({
      user: {
        id: user.id.toString(),
        email: user.email,
        name: user.name,
        role: user.role.name,
        points_balance: user.points_balance,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Password reset request
authRouter.post('/forgot-password', async (req, res) => {
  const schema = z.object({
    email: z.string().email(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());

  try {
    const { email } = parsed.data;
    
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists or not
      return res.json({ message: 'If the email exists, a reset link has been sent' });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { userId: user.id.toString(), email: user.email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '1h' }
    );

    // TODO: Send email with reset link
    // For now, just return success
    res.json({ message: 'If the email exists, a reset link has been sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Reset password
authRouter.post('/reset-password', async (req, res) => {
  const schema = z.object({
    token: z.string(),
    password: z.string().min(8),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());

  try {
    const { token, password } = parsed.data;
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid reset token' });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 12);
    
    // Update password
    await prisma.user.update({
      where: { id: BigInt(decoded.userId) },
      data: { password_hash: passwordHash },
    });

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(400).json({ message: 'Invalid reset token' });
  }
});

// Get current user
authRouter.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    
    const user = await prisma.user.findUnique({
      where: { id: BigInt(decoded.userId) },
      include: { role: true },
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    res.json({
      user: {
        id: user.id.toString(),
        email: user.email,
        name: user.name,
        role: user.role.name,
        points_balance: user.points_balance,
        status: user.status,
      },
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
});
