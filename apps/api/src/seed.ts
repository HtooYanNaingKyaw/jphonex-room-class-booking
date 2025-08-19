import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create roles
  console.log('Creating roles...');
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
    },
  });

  const staffRole = await prisma.role.upsert({
    where: { name: 'staff' },
    update: {},
    create: {
      name: 'staff',
    },
  });

  const userRole = await prisma.role.upsert({
    where: { name: 'user' },
    update: {},
    create: {
      name: 'user',
    },
  });

  console.log('✅ Roles created:', { adminRole, staffRole, userRole });

  // Create admin user
  console.log('Creating admin user...');
  const adminPassword = await bcrypt.hash('admin123', 12);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@jphone.com' },
    update: {},
    create: {
      email: 'admin@jphone.com',
      password_hash: adminPassword,
      name: 'Admin User',
      phone: '+959123456789',
      gender: 'other',
      status: 'active',
      points_balance: 1000,
      role_id: adminRole.id,
    },
  });

  console.log('✅ Admin user created:', adminUser);

  // Create some sample room types
  console.log('Creating room types...');
  const roomType1 = await prisma.roomType.upsert({
    where: { name: 'Standard Room' },
    update: {},
    create: {
      name: 'Standard Room',
      code: 'STD',
    },
  });

  const roomType2 = await prisma.roomType.upsert({
    where: { name: 'Premium Room' },
    update: {},
    create: {
      name: 'Premium Room',
      code: 'PRM',
    },
  });

  console.log('✅ Room types created:', { roomType1, roomType2 });

  // Create some sample rooms
  console.log('Creating rooms...');
  const room1 = await prisma.room.upsert({
    where: { name: 'Room 1' },
    update: {},
    create: {
      name: 'Room 1',
      room_type_id: roomType1.id,
      capacity: 4,
      floor: 1,
      price_per_hour: 5000, // 5000 MMK
      features: { wifi: true, projector: false, whiteboard: true },
    },
  });

  const room2 = await prisma.room.upsert({
    where: { name: 'Room 2' },
    update: {},
    create: {
      name: 'Room 2',
      room_type_id: roomType1.id,
      capacity: 6,
      floor: 1,
      price_per_hour: 6000, // 6000 MMK
      features: { wifi: true, projector: true, whiteboard: true },
    },
  });

  const room3 = await prisma.room.upsert({
    where: { name: 'Room 3' },
    update: {},
    create: {
      name: 'Room 3',
      room_type_id: roomType2.id,
      capacity: 8,
      floor: 2,
      price_per_hour: 8000, // 8000 MMK
      features: { wifi: true, projector: true, whiteboard: true, sound: true },
    },
  });

  console.log('✅ Rooms created:', { room1, room2, room3 });

  // Create some sample policies
  console.log('Creating policies...');
  const policy1 = await prisma.policy.create({
    data: {
      title: 'Room Booking Policy',
      body: 'Rooms can be booked for a minimum of 1 hour and maximum of 8 hours per day. Payment is required at the time of booking.',
      is_active: true,
    },
  });

  const policy2 = await prisma.policy.create({
    data: {
      title: 'Cancellation Policy',
      body: 'Bookings can be cancelled up to 2 hours before the scheduled time. Late cancellations may incur a fee.',
      is_active: true,
    },
  });

  console.log('✅ Policies created:', { policy1, policy2 });

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📋 Login Credentials:');
  console.log('Email: admin@jphone.com');
  console.log('Password: admin123');
  console.log('\n🔑 Use these credentials to login to the admin panel');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
