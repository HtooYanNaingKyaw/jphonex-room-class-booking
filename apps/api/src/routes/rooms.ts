import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

export const roomsRouter = Router();

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
const roomTypeSchema = z.object({
  name: z.string().min(1, 'Name is required').max(64, 'Name too long'),
  code: z.string().max(32, 'Code too long').optional(),
});

const roomSchema = z.object({
  name: z.string().min(1, 'Name is required').max(64, 'Name too long'),
  room_type_id: z.number().int().positive('Room type is required'),
  capacity: z.number().int().positive('Capacity must be positive'),
  status: z.enum(['available', 'maintenance', 'occupied']).default('available'),
  floor: z.number().int().min(0).optional(),
  price_per_hour: z.number().positive().optional(),
  features: z.any().optional(),
});

// Room Types Routes
roomsRouter.get('/types', async (req, res) => {
  try {
    const roomTypes = await prisma.roomType.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(serializeBigInt(roomTypes));
  } catch (error) {
    console.error('Error fetching room types:', error);
    res.status(500).json({ error: 'Failed to fetch room types' });
  }
});

roomsRouter.post('/types', async (req, res) => {
  try {
    const validatedData = roomTypeSchema.parse(req.body);
    
    const roomType = await prisma.roomType.create({
      data: validatedData,
    });
    
    res.status(201).json(serializeBigInt(roomType));
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return res.status(400).json({ error: firstError?.message || 'Validation error' });
    }
    
    if (typeof error === 'object' && error !== null && 'code' in error) {
      if (error.code === 'P2002') {
        return res.status(400).json({ error: 'Room type with this name or code already exists' });
      }
    }
    
    console.error('Error creating room type:', error);
    res.status(500).json({ error: 'Failed to create room type' });
  }
});

roomsRouter.put('/types/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const validatedData = roomTypeSchema.parse(req.body);
    
    const roomType = await prisma.roomType.update({
      where: { id },
      data: validatedData,
    });
    
    res.json(serializeBigInt(roomType));
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return res.status(400).json({ error: firstError?.message || 'Validation error' });
    }
    
    if (typeof error === 'object' && error !== null && 'code' in error) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Room type not found' });
      }
      if (error.code === 'P2002') {
        return res.status(400).json({ error: 'Room type with this name or code already exists' });
      }
    }
    
    console.error('Error updating room type:', error);
    res.status(500).json({ error: 'Failed to update room type' });
  }
});

roomsRouter.delete('/types/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // Check if room type is being used by any rooms
    const roomsUsingType = await prisma.room.findFirst({
      where: { room_type_id: id },
    });
    
    if (roomsUsingType) {
      return res.status(400).json({ 
        error: 'Cannot delete room type that is being used by rooms' 
      });
    }
    
    await prisma.roomType.delete({
      where: { id },
    });
    
    res.status(204).send();
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Room type not found' });
      }
    }
    
    console.error('Error deleting room type:', error);
    res.status(500).json({ error: 'Failed to delete room type' });
  }
});

// Rooms Routes
roomsRouter.get('/', async (req, res) => {
  try {
    const { 
      page = '1', 
      limit = '20', 
      status, 
      room_type_id, 
      search,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;
    
    // Build where clause
    const where: any = {};
    if (status) where.status = status;
    if (room_type_id) where.room_type_id = parseInt(room_type_id as string);
    if (search) {
      where.OR = [
        { name: { contains: search as string } },
        { room_type: { name: { contains: search as string } } },
      ];
    }
    
    // Build order by
    const orderBy: any = {};
    if (sortBy === 'room_type') {
      orderBy.room_type = { name: sortOrder };
    } else {
      orderBy[sortBy as string] = sortOrder;
    }
    
    const [rooms, total] = await Promise.all([
      prisma.room.findMany({
        where,
        include: {
          room_type: {
            select: { id: true, name: true, code: true },
          },
        },
        orderBy,
        skip,
        take: limitNum,
      }),
      prisma.room.count({ where }),
    ]);
    
    res.json(serializeBigInt({
      rooms,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    }));
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

roomsRouter.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        room_type: {
          select: { id: true, name: true, code: true },
        },
        bookings: {
          where: {
            status: { in: ['pending', 'confirmed'] },
            starts_at: { gte: new Date() },
          },
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { starts_at: 'asc' },
        },
      },
    });
    
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    
    res.json(serializeBigInt(room));
  } catch (error) {
    console.error('Error fetching room:', error);
    res.status(500).json({ error: 'Failed to fetch room' });
  }
});

roomsRouter.post('/', async (req, res) => {
  try {
    const validatedData = roomSchema.parse(req.body);
    
    const room = await prisma.room.create({
      data: {
        name: validatedData.name,
        room_type_id: validatedData.room_type_id,
        capacity: validatedData.capacity,
        status: validatedData.status,
        floor: validatedData.floor,
        price_per_hour: validatedData.price_per_hour,
        features: validatedData.features || {},
      },
      include: {
        room_type: {
          select: { id: true, name: true, code: true },
        },
      },
    });
    
    res.status(201).json(serializeBigInt(room));
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return res.status(400).json({ error: firstError?.message || 'Validation error' });
    }
    
    if (typeof error === 'object' && error !== null && 'code' in error) {
      if (error.code === 'P2002') {
        return res.status(400).json({ error: 'Room with this name already exists' });
      }
      if (error.code === 'P2003') {
        return res.status(400).json({ error: 'Invalid room type' });
      }
    }
    
    console.error('Error creating room:', error);
    res.status(500).json({ error: 'Failed to create room' });
  }
});

roomsRouter.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const validatedData = roomSchema.parse(req.body);
    
    const room = await prisma.room.update({
      where: { id },
      data: {
        name: validatedData.name,
        room_type_id: validatedData.room_type_id,
        capacity: validatedData.capacity,
        status: validatedData.status,
        floor: validatedData.floor,
        price_per_hour: validatedData.price_per_hour,
        features: validatedData.features || {},
      },
      include: {
        room_type: {
          select: { id: true, name: true, code: true },
        },
      },
    });
    
    res.json(serializeBigInt(room));
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return res.status(400).json({ error: firstError?.message || 'Validation error' });
    }
    
    if (typeof error === 'object' && error !== null && 'code' in error) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Room not found' });
      }
      if (error.code === 'P2002') {
        return res.status(400).json({ error: 'Room with this name already exists' });
      }
      if (error.code === 'P2003') {
        return res.status(400).json({ error: 'Invalid room type' });
      }
    }
    
    console.error('Error updating room:', error);
    res.status(500).json({ error: 'Failed to update room' });
  }
});

roomsRouter.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // Check if room has any active bookings
    const activeBookings = await prisma.booking.findFirst({
      where: {
        room_id: id,
        status: { in: ['pending', 'confirmed'] },
        starts_at: { gte: new Date() },
      },
    });
    
    if (activeBookings) {
      return res.status(400).json({ 
        error: 'Cannot delete room with active bookings' 
      });
    }
    
    // Check if room is scheduled for any classes
    const scheduledClasses = await prisma.classSchedule.findFirst({
      where: {
        room_id: id,
        starts_at: { gte: new Date() },
      },
    });
    
    if (scheduledClasses) {
      return res.status(400).json({ 
        error: 'Cannot delete room with scheduled classes' 
      });
    }
    
    await prisma.room.delete({
      where: { id },
    });
    
    res.status(204).send();
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Room not found' });
      }
    }
    
    console.error('Error deleting room:', error);
    res.status(500).json({ error: 'Failed to delete room' });
  }
});

// Room availability check
roomsRouter.get('/:id/availability', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { date, start_time, end_time } = req.query;
    
    if (!date || !start_time || !end_time) {
      return res.status(400).json({ 
        error: 'Date, start_time, and end_time are required' 
      });
    }
    
    const startDateTime = new Date(`${date}T${start_time}`);
    const endDateTime = new Date(`${date}T${end_time}`);
    
    // Check for conflicting bookings
    const conflictingBookings = await prisma.booking.findFirst({
      where: {
        room_id: id,
        status: { in: ['pending', 'confirmed'] },
        OR: [
          {
            starts_at: { lt: endDateTime },
            ends_at: { gt: startDateTime },
          },
        ],
      },
    });
    
    // Check for conflicting class schedules
    const conflictingClasses = await prisma.classSchedule.findFirst({
      where: {
        room_id: id,
        OR: [
          {
            starts_at: { lt: endDateTime },
            ends_at: { gt: startDateTime },
          },
        ],
      },
    });
    
    const isAvailable = !conflictingBookings && !conflictingClasses;
    
    res.json(serializeBigInt({
      room_id: id,
      date,
      start_time,
      end_time,
      is_available: isAvailable,
      conflicting_bookings: conflictingBookings ? 1 : 0,
      conflicting_classes: conflictingClasses ? 1 : 0,
    }));
  } catch (error) {
    console.error('Error checking room availability:', error);
    res.status(500).json({ error: 'Failed to check room availability' });
  }
});

export default roomsRouter;