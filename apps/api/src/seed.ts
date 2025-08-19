import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: { name: 'admin' },
  });

  const userRole = await prisma.role.upsert({
    where: { name: 'user' },
    update: {},
    create: { name: 'user' },
  });

  console.log('✅ Roles created');

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@jphone.com' },
    update: {},
    create: {
      email: 'admin@jphone.com',
      password_hash: '$2a$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu1.m', // password: admin123
      name: 'Admin User',
      role_id: adminRole.id,
    },
  });

  console.log('✅ Admin user created');

  // Create room types
  const roomTypes = await Promise.all([
    prisma.roomType.upsert({
      where: { name: 'Conference Room' },
      update: {},
      create: {
        name: 'Conference Room',
        code: 'CONF',
      },
    }),
    prisma.roomType.upsert({
      where: { name: 'Meeting Room' },
      update: {},
      create: {
        name: 'Meeting Room',
        code: 'MEET',
      },
    }),
    prisma.roomType.upsert({
      where: { name: 'Training Room' },
      update: {},
      create: {
        name: 'Training Room',
        code: 'TRAIN',
      },
    }),
    prisma.roomType.upsert({
      where: { name: 'Private Office' },
      update: {},
      create: {
        name: 'Private Office',
        code: 'OFFICE',
      },
    }),
  ]);

  console.log('✅ Room types created');

  // Create rooms
  const rooms = await Promise.all([
    prisma.room.upsert({
      where: { name: 'Conference Room A' },
      update: {},
      create: {
        name: 'Conference Room A',
        room_type_id: roomTypes[0].id,
        capacity: 20,
        status: 'available',
        floor: 1,
        price_per_hour: 50.00,
        features: {
          projector: true,
          whiteboard: true,
          videoConference: true,
        },
      },
    }),
    prisma.room.upsert({
      where: { name: 'Conference Room B' },
      update: {},
      create: {
        name: 'Conference Room B',
        room_type_id: roomTypes[0].id,
        capacity: 15,
        status: 'available',
        floor: 1,
        price_per_hour: 40.00,
        features: {
          projector: true,
          whiteboard: true,
        },
      },
    }),
    prisma.room.upsert({
      where: { name: 'Meeting Room 1' },
      update: {},
      create: {
        name: 'Meeting Room 1',
        room_type_id: roomTypes[1].id,
        capacity: 8,
        status: 'available',
        floor: 2,
        price_per_hour: 25.00,
        features: {
          whiteboard: true,
        },
      },
    }),
    prisma.room.upsert({
      where: { name: 'Meeting Room 2' },
      update: {},
      create: {
        name: 'Meeting Room 2',
        room_type_id: roomTypes[1].id,
        capacity: 6,
        status: 'maintenance',
        floor: 2,
        price_per_hour: 20.00,
        features: {},
      },
    }),
    prisma.room.upsert({
      where: { name: 'Training Room Alpha' },
      update: {},
      create: {
        name: 'Training Room Alpha',
        room_type_id: roomTypes[2].id,
        capacity: 30,
        status: 'available',
        floor: 3,
        price_per_hour: 60.00,
        features: {
          projector: true,
          whiteboard: true,
          videoConference: true,
          soundSystem: true,
        },
      },
    }),
    prisma.room.upsert({
      where: { name: 'Private Office 101' },
      update: {},
      create: {
        name: 'Private Office 101',
        room_type_id: roomTypes[3].id,
        capacity: 2,
        status: 'available',
        floor: 1,
        price_per_hour: 35.00,
        features: {
          desk: true,
          chair: true,
          wifi: true,
        },
      },
    }),
  ]);

  console.log('✅ Rooms created');

  // Create some sample classes
  const classes = await Promise.all([
    prisma.class.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        title: 'Introduction to Programming',
        description: 'Learn the basics of programming with Python',
        instructor_id: adminUser.id,
        max_seats: 25,
      },
    }),
    prisma.class.upsert({
      where: { id: 2 },
      update: {},
      create: {
        id: 2,
        title: 'Web Development Fundamentals',
        description: 'Build modern web applications with React',
        instructor_id: adminUser.id,
        max_seats: 20,
      },
    }),
  ]);

  console.log('✅ Classes created');

  // Create some sample class schedules
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  const classSchedules = await Promise.all([
    prisma.classSchedule.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        class_id: classes[0].id,
        room_id: rooms[4].id, // Training Room Alpha
        starts_at: tomorrow,
        ends_at: new Date(tomorrow.getTime() + 2 * 60 * 60 * 1000), // 2 hours later
        capacity_override: 25,
      },
    }),
    prisma.classSchedule.upsert({
      where: { id: 2 },
      update: {},
      create: {
        id: 2,
        class_id: classes[1].id,
        room_id: rooms[0].id, // Conference Room A
        starts_at: new Date(tomorrow.getTime() + 3 * 60 * 60 * 1000),
        ends_at: new Date(tomorrow.getTime() + 5 * 60 * 60 * 1000), // 2 hours later
        capacity_override: 20,
      },
    }),
  ]);

  console.log('✅ Class schedules created');

  console.log('🎉 Database seeding completed successfully!');
  console.log(`Created ${roomTypes.length} room types`);
  console.log(`Created ${rooms.length} rooms`);
  console.log(`Created ${classes.length} classes`);
  console.log(`Created ${classSchedules.length} class schedules`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
