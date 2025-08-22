import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

export const classesRouter = Router();

// Helper function to convert BigInt to number for JSON serialization
const serializeBigInt = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === 'bigint') {
    return Number(obj);
  }
  
  if (obj instanceof Date) {
    return obj.toISOString();
  }
  
  if (Array.isArray(obj)) {
    return obj.map(serializeBigInt);
  }
  
  if (typeof obj === 'object') {
    const result: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        result[key] = serializeBigInt(obj[key]);
      }
    }
    return result;
  }
  
  return obj;
};

// Validation schemas
const classSchema = z.object({
  title: z.string().min(1, 'Title is required').max(191, 'Title too long'),
  description: z.string().max(65535, 'Description too long').optional(),
  instructor_id: z.number().int().positive('Instructor is required'),
  max_seats: z.number().int().positive('Max seats must be positive'),
});

const classScheduleSchema = z.object({
  class_id: z.number().int().positive('Class is required'),
  room_id: z.number().int().positive('Room is required').optional(),
  starts_at: z.string().datetime('Invalid start date'),
  ends_at: z.string().datetime('Invalid end date'),
  capacity_override: z.number().int().positive('Capacity override must be positive').optional(),
});

// Classes Routes
classesRouter.get('/', async (req, res) => {
  try {
    const { 
      page = '1', 
      limit = '20', 
      instructor_id, 
      search,
      sortBy = 'title',
      sortOrder = 'asc'
    } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;
    
    // Build where clause
    const where: any = {};
    if (instructor_id) where.instructor_id = parseInt(instructor_id as string);
    if (search) {
      where.OR = [
        { title: { contains: search as string } },
        { description: { contains: search as string } },
        { instructor: { name: { contains: search as string } } },
      ];
    }
    
    // Build order by
    const orderBy: any = {};
    if (sortBy === 'instructor') {
      orderBy.instructor = { name: sortOrder };
    } else {
      orderBy[sortBy as string] = sortOrder;
    }
    
    const [classes, total] = await Promise.all([
      prisma.class.findMany({
        where,
        include: {
          instructor: {
            select: { id: true, name: true, email: true },
          },
          schedules: {
            include: {
              room: {
                select: { id: true, name: true, room_type: { select: { name: true } } },
              },
            },
            orderBy: { starts_at: 'asc' },
          },
        },
        orderBy,
        skip,
        take: limitNum,
      }),
      prisma.class.count({ where }),
    ]);
    
    res.json(serializeBigInt({
      classes,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    }));
  } catch (error) {
    console.error('Error fetching classes:', error);
    res.status(500).json({ error: 'Failed to fetch classes' });
  }
});

classesRouter.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    const classData = await prisma.class.findUnique({
      where: { id },
      include: {
        instructor: {
          select: { id: true, name: true, email: true },
        },
        schedules: {
          include: {
            room: {
              select: { id: true, name: true, room_type: { select: { name: true } } },
            },
            bookings: {
              include: {
                user: {
                  select: { id: true, name: true, email: true },
                },
              },
              orderBy: { created_at: 'desc' },
            },
            attendance: {
              include: {
                user: {
                  select: { id: true, name: true, email: true },
                },
              },
              orderBy: { created_at: 'desc' },
            },
          },
          orderBy: { starts_at: 'asc' },
        },
      },
    });
    
    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }
    
    res.json(serializeBigInt(classData));
  } catch (error) {
    console.error('Error fetching class:', error);
    res.status(500).json({ error: 'Failed to fetch class' });
  }
});

classesRouter.post('/', async (req, res) => {
  try {
    const validatedData = classSchema.parse(req.body);
    
    const classData = await prisma.class.create({
      data: validatedData,
      include: {
        instructor: {
          select: { id: true, name: true, email: true },
        },
      },
    });
    
    res.status(201).json(serializeBigInt(classData));
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return res.status(400).json({ error: firstError?.message || 'Validation error' });
    }
    
    if (typeof error === 'object' && error !== null && 'code' in error) {
      if (error.code === 'P2003') {
        return res.status(400).json({ error: 'Invalid instructor' });
      }
    }
    
    console.error('Error creating class:', error);
    res.status(500).json({ error: 'Failed to create class' });
  }
});

classesRouter.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const validatedData = classSchema.parse(req.body);
    
    const classData = await prisma.class.update({
      where: { id },
      data: validatedData,
      include: {
        instructor: {
          select: { id: true, name: true, email: true },
        },
      },
    });
    
    res.json(serializeBigInt(classData));
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return res.status(400).json({ error: firstError?.message || 'Validation error' });
    }
    
    if (typeof error === 'object' && error !== null && 'code' in error) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Class not found' });
      }
      if (error.code === 'P2003') {
        return res.status(400).json({ error: 'Invalid instructor' });
      }
    }
    
    console.error('Error updating class:', error);
    res.status(500).json({ error: 'Failed to update class' });
  }
});

classesRouter.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // Check if class has any schedules
    const hasSchedules = await prisma.classSchedule.findFirst({
      where: { class_id: id },
    });
    
    if (hasSchedules) {
      return res.status(400).json({ 
        error: 'Cannot delete class with scheduled sessions' 
      });
    }
    
    await prisma.class.delete({
      where: { id },
    });
    
    res.status(204).send();
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Class not found' });
      }
    }
    
    console.error('Error deleting class:', error);
    res.status(500).json({ error: 'Failed to delete class' });
  }
});

// Class Schedules Routes
classesRouter.get('/:id/schedules', async (req, res) => {
  try {
    const classId = parseInt(req.params.id);
    
    const schedules = await prisma.classSchedule.findMany({
      where: { class_id: classId },
      include: {
        room: {
          select: { id: true, name: true, room_type: { select: { name: true } } },
        },
        bookings: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        attendance: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
      orderBy: { starts_at: 'asc' },
    });
    
    res.json(serializeBigInt(schedules));
  } catch (error) {
    console.error('Error fetching class schedules:', error);
    res.status(500).json({ error: 'Failed to fetch class schedules' });
  }
});

classesRouter.post('/:id/schedules', async (req, res) => {
  try {
    const classId = parseInt(req.params.id);
    const validatedData = classScheduleSchema.parse(req.body);
    
    // Verify the class exists
    const classExists = await prisma.class.findUnique({
      where: { id: classId },
    });
    
    if (!classExists) {
      return res.status(404).json({ error: 'Class not found' });
    }
    
    // Check for room conflicts if room is specified
    if (validatedData.room_id) {
      const startTime = new Date(validatedData.starts_at);
      const endTime = new Date(validatedData.ends_at);
      
      const conflictingSchedule = await prisma.classSchedule.findFirst({
        where: {
          room_id: validatedData.room_id,
          OR: [
            {
              starts_at: { lt: endTime },
              ends_at: { gt: startTime },
            },
          ],
        },
      });
      
      if (conflictingSchedule) {
        return res.status(400).json({ 
          error: 'Room is not available during the specified time' 
        });
      }
    }
    
    const schedule = await prisma.classSchedule.create({
      data: {
        ...validatedData,
        class_id: classId,
        starts_at: new Date(validatedData.starts_at),
        ends_at: new Date(validatedData.ends_at),
      },
      include: {
        room: {
          select: { id: true, name: true, room_type: { select: { name: true } } },
        },
      },
    });
    
    res.status(201).json(serializeBigInt(schedule));
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return res.status(400).json({ error: firstError?.message || 'Validation error' });
    }
    
    console.error('Error creating class schedule:', error);
    res.status(500).json({ error: 'Failed to create class schedule' });
  }
});

classesRouter.put('/schedules/:id', async (req, res) => {
  try {
    const scheduleId = parseInt(req.params.id);
    const validatedData = classScheduleSchema.parse(req.body);
    
    // Check for room conflicts if room is being changed
    if (validatedData.room_id) {
      const startTime = new Date(validatedData.starts_at);
      const endTime = new Date(validatedData.ends_at);
      
      const conflictingSchedule = await prisma.classSchedule.findFirst({
        where: {
          room_id: validatedData.room_id,
          id: { not: scheduleId },
          OR: [
            {
              starts_at: { lt: endTime },
              ends_at: { gt: startTime },
            },
          ],
        },
      });
      
      if (conflictingSchedule) {
        return res.status(400).json({ 
          error: 'Room is not available during the specified time' 
        });
      }
    }
    
    const schedule = await prisma.classSchedule.update({
      where: { id: scheduleId },
      data: {
        ...validatedData,
        starts_at: new Date(validatedData.starts_at),
        ends_at: new Date(validatedData.ends_at),
      },
      include: {
        room: {
          select: { id: true, name: true, room_type: { select: { name: true } } },
        },
      },
    });
    
    res.json(serializeBigInt(schedule));
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return res.status(400).json({ error: firstError?.message || 'Validation error' });
    }
    
    if (typeof error === 'object' && error !== null && 'code' in error) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Class schedule not found' });
      }
    }
    
    console.error('Error updating class schedule:', error);
    res.status(500).json({ error: 'Failed to update class schedule' });
  }
});

classesRouter.delete('/schedules/:id', async (req, res) => {
  try {
    const scheduleId = parseInt(req.params.id);
    
    // Check if schedule has any bookings
    const hasBookings = await prisma.booking.findFirst({
      where: { class_schedule_id: scheduleId },
    });
    
    if (hasBookings) {
      return res.status(400).json({ 
        error: 'Cannot delete schedule with existing bookings' 
      });
    }
    
    await prisma.classSchedule.delete({
      where: { id: scheduleId },
    });
    
    res.status(204).send();
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Class schedule not found' });
      }
    }
    
    console.error('Error deleting class schedule:', error);
    res.status(500).json({ error: 'Failed to delete class schedule' });
  }
});

export default classesRouter;