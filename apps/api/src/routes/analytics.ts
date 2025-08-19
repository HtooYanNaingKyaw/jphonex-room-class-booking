import { Router } from 'express';
import { prisma } from '../prisma';

export const analyticsRouter = Router();

// Get dashboard overview data
analyticsRouter.get('/dashboard', async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());

    // Total users
    const totalUsers = await prisma.user.count();
    const activeUsers = await prisma.user.count({ where: { status: 'active' } });

    // Total bookings
    const totalBookings = await prisma.booking.count();
    const confirmedBookings = await prisma.booking.count({ where: { status: 'confirmed' } });
    const pendingBookings = await prisma.booking.count({ where: { status: 'pending' } });

    // Monthly bookings
    const monthlyBookings = await prisma.booking.count({
      where: { created_at: { gte: startOfMonth } }
    });

    // Weekly bookings
    const weeklyBookings = await prisma.booking.count({
      where: { created_at: { gte: startOfWeek } }
    });

    // Total income
    const totalIncome = await prisma.payment.aggregate({
      where: { status: 'paid' },
      _sum: { amount: true }
    });

    // Monthly income
    const monthlyIncome = await prisma.payment.aggregate({
      where: {
        status: 'paid',
        paid_at: { gte: startOfMonth }
      },
      _sum: { amount: true }
    });

    // Weekly income
    const weeklyIncome = await prisma.payment.aggregate({
      where: {
        status: 'paid',
        paid_at: { gte: startOfWeek }
      },
      _sum: { amount: true }
    });

    // Room occupancy
    const totalRooms = await prisma.room.count();
    const availableRooms = await prisma.room.count({ where: { status: 'available' } });

    // Recent bookings
    const recentBookings = await prisma.booking.findMany({
      include: {
        user: { select: { name: true, email: true } },
        room: { select: { name: true } },
        class_schedule: {
          include: {
            class: { select: { title: true } }
          }
        }
      },
      orderBy: { created_at: 'desc' },
      take: 10
    });

    // Top users by points
    const topUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        points_balance: true
      },
      orderBy: { points_balance: 'desc' },
      take: 5
    });

    res.json({
      overview: {
        totalUsers,
        activeUsers,
        totalBookings,
        confirmedBookings,
        pendingBookings,
        monthlyBookings,
        weeklyBookings,
        totalIncome: totalIncome._sum.amount || 0,
        monthlyIncome: monthlyIncome._sum.amount || 0,
        weeklyIncome: weeklyIncome._sum.amount || 0,
        totalRooms,
        availableRooms,
        occupancyRate: totalRooms > 0 ? ((totalRooms - availableRooms) / totalRooms * 100).toFixed(1) : 0
      },
      recentBookings: recentBookings.map(booking => ({
        id: booking.id.toString(),
        kind: booking.kind,
        status: booking.status,
        starts_at: booking.starts_at,
        ends_at: booking.ends_at,
        user: {
          id: (booking.user as any).id?.toString() || '',
          name: booking.user.name,
          email: booking.user.email
        },
        room: booking.room?.name,
        class: booking.class_schedule?.class?.title,
        created_at: booking.created_at
      })),
      topUsers: topUsers.map(user => ({
        id: user.id.toString(),
        name: user.name,
        email: user.email,
        points_balance: user.points_balance
      }))
    });
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get booking analytics by date range
analyticsRouter.get('/bookings', async (req, res) => {
  try {
    const startDate = req.query.start ? new Date(req.query.start as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = req.query.end ? new Date(req.query.end as string) : new Date();

    // Daily bookings
    const dailyBookings = await prisma.$queryRaw`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count,
        SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'canceled' THEN 1 ELSE 0 END) as canceled
      FROM Booking 
      WHERE created_at BETWEEN ${startDate} AND ${endDate}
      GROUP BY DATE(created_at)
      ORDER BY date
    `;

    // Booking by type
    const bookingByType = await prisma.booking.groupBy({
      by: ['kind'],
      where: {
        created_at: { gte: startDate, lte: endDate }
      },
      _count: true
    });

    // Booking by source
    const bookingBySource = await prisma.booking.groupBy({
      by: ['source'],
      where: {
        created_at: { gte: startDate, lte: endDate }
      },
      _count: true
    });

    // Top rooms
    const topRooms = await prisma.booking.groupBy({
      by: ['room_id'],
      where: {
        room_id: { not: null },
        created_at: { gte: startDate, lte: endDate }
      },
      _count: true,
      orderBy: { _count: { room_id: 'desc' } },
      take: 5
    });

    // Get room names for top rooms
    const roomIds = topRooms.map(r => r.room_id).filter((id): id is bigint => id !== null);
    const rooms = await prisma.room.findMany({
      where: { id: { in: roomIds } },
      select: { id: true, name: true }
    });

    const topRoomsWithNames = topRooms.map(room => ({
      room_id: room.room_id?.toString(),
      count: Number(room._count),
      name: rooms.find(r => r.id === room.room_id)?.name || 'Unknown'
    }));

    res.json({
      dailyBookings,
      bookingByType: bookingByType.map((type: any) => ({
        kind: type.kind,
        _count: Number(type._count)
      })),
      bookingBySource: bookingBySource.map((source: any) => ({
        source: source.source,
        _count: Number(source._count)
      })),
      topRooms: topRoomsWithNames
    });
  } catch (error) {
    console.error('Booking analytics error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get revenue analytics
analyticsRouter.get('/revenue', async (req, res) => {
  try {
    const startDate = req.query.start ? new Date(req.query.start as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = req.query.end ? new Date(req.query.end as string) : new Date();

    // Daily revenue
    const dailyRevenue = await prisma.$queryRaw`
      SELECT 
        DATE(paid_at) as date,
        SUM(amount) as total,
        COUNT(*) as transactions
      FROM Payment 
      WHERE status = 'paid' AND paid_at BETWEEN ${startDate} AND ${endDate}
      GROUP BY DATE(paid_at)
      ORDER BY date
    `;

    // Revenue by payment type
    const revenueByType = await prisma.payment.groupBy({
      by: ['type'],
      where: {
        status: 'paid',
        paid_at: { gte: startDate, lte: endDate }
      },
      _sum: { amount: true },
      _count: true
    });

    // Revenue by provider
    const revenueByProvider = await prisma.payment.groupBy({
      by: ['provider'],
      where: {
        status: 'paid',
        paid_at: { gte: startDate, lte: endDate }
      },
      _sum: { amount: true },
      _count: true
    });

    res.json({
      dailyRevenue,
      revenueByType: revenueByType.map((type: any) => ({
        type: type.type,
        _sum: { amount: type._sum.amount },
        _count: Number(type._count)
      })),
      revenueByProvider: revenueByProvider.map((provider: any) => ({
        provider: provider.provider,
        _sum: { amount: provider._sum.amount },
        _count: Number(provider._count)
      }))
    });
  } catch (error) {
    console.error('Revenue analytics error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user analytics
analyticsRouter.get('/users', async (req, res) => {
  try {
    const startDate = req.query.start ? new Date(req.query.start as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = req.query.end ? new Date(req.query.end as string) : new Date();

    // User registrations by date
    const userRegistrations = await prisma.$queryRaw<Array<{ date: string; count: bigint }>>`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM User 
      WHERE created_at BETWEEN ${startDate} AND ${endDate}
      GROUP BY DATE(created_at)
      ORDER BY date
    `;

    // Users by status
    const usersByStatus = await prisma.user.groupBy({
      by: ['status'],
      _count: true
    });

    // Users by role
    const usersByRole = await prisma.user.groupBy({
      by: ['role_id'],
      _count: true
    });

    // Get role names
    const roleIds = usersByRole.map(u => u.role_id);
    const roles = await prisma.role.findMany({
      where: { id: { in: roleIds } },
      select: { id: true, name: true }
    });

    const usersByRoleWithNames = usersByRole.map(user => ({
      role_id: user.role_id.toString(),
      count: Number(user._count),
      role_name: roles.find(r => r.id === user.role_id)?.name || 'Unknown'
    }));

    // Top users by bookings
    const topUsersByBookings = await prisma.booking.groupBy({
      by: ['user_id'],
      where: {
        created_at: { gte: startDate, lte: endDate }
      },
      _count: true,
      orderBy: { _count: { user_id: 'desc' } },
      take: 10
    });

    // Get user names for top users
    const userIds = topUsersByBookings.map(u => u.user_id);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true }
    });

    const topUsersWithNames = topUsersByBookings.map(user => ({
      user_id: user.user_id.toString(),
      count: Number(user._count),
      user: users.find(u => u.id === user.user_id) ? {
        id: users.find(u => u.id === user.user_id)!.id.toString(),
        name: users.find(u => u.id === user.user_id)!.name,
        email: users.find(u => u.id === user.user_id)!.email
      } : null
    }));

    res.json({
      userRegistrations: userRegistrations.map((reg: any) => ({
        date: reg.date,
        count: Number(reg.count)
      })),
      usersByStatus: usersByStatus.map((status: any) => ({
        status: status.status,
        _count: Number(status._count)
      })),
      usersByRole: usersByRoleWithNames,
      topUsersByBookings: topUsersWithNames
    });
  } catch (error) {
    console.error('User analytics error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Export data for reports
analyticsRouter.get('/export', async (req, res) => {
  try {
    const type = req.query.type as string;
    const startDate = req.query.start ? new Date(req.query.start as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = req.query.end ? new Date(req.query.end as string) : new Date();

    let data: any[] = [];

    switch (type) {
      case 'bookings':
        data = await prisma.booking.findMany({
          where: {
            created_at: { gte: startDate, lte: endDate }
          },
          include: {
            user: { select: { name: true, email: true } },
            room: { select: { name: true } },
            class_schedule: {
              include: {
                class: { select: { title: true } }
              }
            },
            payments: true
          },
          orderBy: { created_at: 'desc' }
        });
        break;

      case 'payments':
        data = await prisma.payment.findMany({
          where: {
            created_at: { gte: startDate, lte: endDate }
          },
          include: {
            booking: {
              include: {
                user: { select: { name: true, email: true } }
              }
            }
          },
          orderBy: { created_at: 'desc' }
        });
        break;

      case 'users':
        data = await prisma.user.findMany({
          where: {
            created_at: { gte: startDate, lte: endDate }
          },
          include: {
            role: true,
            bookings: {
              select: { id: true }
            }
          },
          orderBy: { created_at: 'desc' }
        });
        break;

      default:
        return res.status(400).json({ message: 'Invalid export type' });
    }

    // Convert any BigInt IDs to strings in the export data
    const sanitizedData = data.map((item: any) => {
      if (item.id && typeof item.id === 'bigint') {
        return { ...item, id: item.id.toString() };
      }
      if (item.user_id && typeof item.user_id === 'bigint') {
        return { ...item, user_id: item.user_id.toString() };
      }
      if (item.room_id && typeof item.room_id === 'bigint') {
        return { ...item, room_id: item.room_id.toString() };
      }
      if (item.booking_id && typeof item.booking_id === 'bigint') {
        return { ...item, booking_id: item.booking_id.toString() };
      }
      return item;
    });

    res.json({
      type,
      startDate,
      endDate,
      count: sanitizedData.length,
      data: sanitizedData
    });
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
