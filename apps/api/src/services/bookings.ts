import { prisma } from '../prisma';
import { Prisma } from '@prisma/client';

export async function bookRoom(params: {
  userId: bigint; roomId: bigint; start: Date; end: Date; source: 'web'|'mobile'|'walkin'; depositMMK?: number;
}) {
  const { userId, roomId, start, end, source, depositMMK = 0 } = params;

  return prisma.$transaction(async (tx) => {
    // lock conflicts
    const conflicts = await tx.$queryRawUnsafe<any[]>(
      `SELECT id FROM bookings
       WHERE kind='room' AND room_id=? AND status IN ('pending','confirmed')
         AND NOT (ends_at <= ? OR starts_at >= ?)
       FOR UPDATE`,
      roomId, start, end
    );
    if (conflicts.length) throw new Error('TIME_CONFLICT');

    const booking = await tx.booking.create({
      data: {
        user_id: userId, kind: 'room', room_id: roomId, status: 'pending',
        source, starts_at: start, ends_at: end,
        holds_expires_at: new Date(Date.now() + 10 * 60 * 1000)
      }
    });

    if (depositMMK > 0) {
      await tx.payment.create({
        data: {
          booking_id: booking.id,
          amount: new Prisma.Decimal(depositMMK),
          currency: 'MMK', type: 'deposit', provider: 'KBZPay', status: 'pending'
        }
      });
    }
    return booking;
  });
}

export async function extendRoomBooking(params: {
  bookingId: bigint; extraMinutes: number; amountMMK?: number; provider?: string;
}) {
  const { bookingId, extraMinutes, amountMMK = 0, provider = 'KBZPay' } = params;

  return prisma.$transaction(async (tx) => {
    const b = await tx.booking.findFirst({ where: { id: bookingId, kind: 'room' } });
    if (!b) throw new Error('NOT_FOUND');

    const newEnd = new Date(b.ends_at.getTime() + extraMinutes * 60 * 1000);

    const conflicts = await tx.$queryRawUnsafe<any[]>(
      `SELECT id FROM bookings
       WHERE kind='room' AND room_id=? AND id<>? AND status IN ('pending','confirmed')
         AND NOT (ends_at <= ? OR starts_at >= ?)
       FOR UPDATE`,
      b.room_id, bookingId, b.ends_at, newEnd
    );
    if (conflicts.length) throw new Error('TIME_CONFLICT');

    await tx.booking.update({ where: { id: bookingId }, data: { ends_at: newEnd } });

    if (amountMMK > 0) {
      await tx.payment.create({
        data: {
          booking_id: bookingId,
          amount: new Prisma.Decimal(amountMMK),
          currency: 'MMK', type: 'balance', provider, status: 'pending'
        }
      });
    }
  });
}
