import { Router } from 'express';
import { z } from 'zod';
import { bookRoom, extendRoomBooking } from '../services/bookings';

export const bookingsRouter = Router();

bookingsRouter.post('/rooms/:roomId/book', async (req, res) => {
  const schema = z.object({
    start: z.string().datetime(),
    end: z.string().datetime(),
    source: z.enum(['web','mobile','walkin']),
    deposit: z.number().int().nonnegative().optional()
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());

  try {
    const b = await bookRoom({
      userId: BigInt(1), // TODO: use auth user
      roomId: BigInt(req.params.roomId),
      start: new Date(parsed.data.start),
      end: new Date(parsed.data.end),
      source: parsed.data.source,
      depositMMK: parsed.data.deposit ?? 0
    });
    res.json(b);
  } catch (e: any) {
    if (String(e.message) === 'TIME_CONFLICT') return res.status(409).json({ message: 'Time window not available' });
    throw e;
  }
});

bookingsRouter.post('/:id/extend', async (req, res) => {
  const schema = z.object({
    extraMinutes: z.number().int().positive(),
    amount: z.number().int().nonnegative().optional()
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());

  try {
    await extendRoomBooking({
      bookingId: BigInt(req.params.id),
      extraMinutes: parsed.data.extraMinutes,
      amountMMK: parsed.data.amount ?? 0
    });
    res.json({ ok: true });
  } catch (e: any) {
    if (String(e.message) === 'TIME_CONFLICT') return res.status(409).json({ message: 'Extension not available' });
    if (String(e.message) === 'NOT_FOUND') return res.status(404).json({ message: 'Booking not found' });
    throw e;
  }
});
