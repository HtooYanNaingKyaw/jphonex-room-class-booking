import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma';

export const usersRouter = Router();

// Get all users with pagination and filters
usersRouter.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const status = req.query.status as string;
    const role = req.query.role as string;

    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ];
    }
    
    if (status) {
      where.status = status;
    }
    
    if (role) {
      where.role = { name: role };
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          role: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      users: users.map(user => ({
        id: user.id.toString(),
        email: user.email,
        name: user.name,
        phone: user.phone,
        gender: user.gender,
        dob: user.dob,
        status: user.status,
        points_balance: user.points_balance,
        role: user.role.name,
        created_at: user.created_at,
        updated_at: user.updated_at,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user by ID
usersRouter.get('/:id', async (req, res) => {
  try {
    const userId = BigInt(req.params.id);
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
        bookings: {
          include: {
            room: true,
            class_schedule: {
              include: {
                class: true,
              },
            },
            payments: true,
          },
          orderBy: { created_at: 'desc' },
          take: 10,
        },
        points_ledger: {
          orderBy: { created_at: 'desc' },
          take: 10,
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user.id.toString(),
      email: user.email,
      name: user.name,
      phone: user.phone,
      gender: user.gender,
      dob: user.dob,
      status: user.status,
      points_balance: user.points_balance,
      role: user.role.name,
      created_at: user.created_at,
      updated_at: user.updated_at,
      recent_bookings: user.bookings,
      recent_points: user.points_ledger,
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new user
usersRouter.post('/', async (req, res) => {
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().min(2),
    phone: z.string().optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
    dob: z.string().datetime().optional(),
    role_id: z.number().int().positive(),
    status: z.enum(['active', 'inactive', 'locked']).default('active'),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());

  try {
    const { email, password, name, phone, gender, dob, role_id, status } = parsed.data;
    
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone }].filter(Boolean) }
    });
    
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // Hash password
    const bcrypt = require('bcryptjs');
    const passwordHash = await bcrypt.hash(password, 12);
    
    const user = await prisma.user.create({
      data: {
        email,
        password_hash: passwordHash,
        name,
        phone,
        gender,
        dob: dob ? new Date(dob) : null,
        role_id,
        status,
      },
      include: {
        role: true,
      },
    });

    res.status(201).json({
      id: user.id.toString(),
      email: user.email,
      name: user.name,
      phone: user.phone,
      gender: user.gender,
      dob: user.dob,
      status: user.status,
      points_balance: user.points_balance,
      role: user.role.name,
      created_at: user.created_at,
      updated_at: user.updated_at,
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update user
usersRouter.put('/:id', async (req, res) => {
  const schema = z.object({
    name: z.string().min(2).optional(),
    phone: z.string().optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
    dob: z.string().datetime().optional(),
    role_id: z.number().int().positive().optional(),
    status: z.enum(['active', 'inactive', 'locked']).optional(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());

  try {
    const userId = BigInt(req.params.id);
    const updateData: any = { ...parsed.data };
    
    if (updateData.dob) {
      updateData.dob = new Date(updateData.dob);
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: {
        role: true,
      },
    });

    res.json({
      id: user.id.toString(),
      email: user.email,
      name: user.name,
      phone: user.phone,
      gender: user.gender,
      dob: user.dob,
      status: user.status,
      points_balance: user.points_balance,
      role: user.role.name,
      created_at: user.created_at,
      updated_at: user.updated_at,
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Adjust user points
usersRouter.post('/:id/points', async (req, res) => {
  const schema = z.object({
    delta: z.number().int(),
    reason: z.string().min(1),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());

  try {
    const userId = BigInt(req.params.id);
    const { delta, reason } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create points ledger entry
    await prisma.pointsLedger.create({
      data: {
        user_id: userId,
        delta,
        reason,
      },
    });

    // Update user's points balance
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        points_balance: user.points_balance + delta,
      },
    });

    res.json({
      message: 'Points adjusted successfully',
      new_balance: updatedUser.points_balance,
    });
  } catch (error) {
    console.error('Adjust points error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user points history
usersRouter.get('/:id/points', async (req, res) => {
  try {
    const userId = BigInt(req.params.id);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const [points, total] = await Promise.all([
      prisma.pointsLedger.findMany({
        where: { user_id: userId },
        include: {
          booking: {
            include: {
              room: true,
              class_schedule: {
                include: {
                  class: true,
                },
              },
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      prisma.pointsLedger.count({ where: { user_id: userId } }),
    ]);

    res.json({
      points: points.map(point => ({
        id: point.id.toString(),
        delta: point.delta,
        reason: point.reason,
        booking: point.booking ? {
          id: point.booking.id.toString(),
          kind: point.booking.kind,
          room: point.booking.room?.name,
          class: point.booking.class_schedule?.class?.title,
        } : null,
        created_at: point.created_at,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get points history error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all roles
usersRouter.get('/roles/list', async (req, res) => {
  try {
    const roles = await prisma.role.findMany({
      orderBy: { id: 'asc' },
    });

    res.json(roles.map(role => ({
      id: role.id.toString(),
      name: role.name,
    })));
  } catch (error) {
    console.error('Get roles error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
