# jPhone Room & Class Booking System

A comprehensive cross-platform room and class booking system with real-time availability, administrative control, booking analytics, and a point reward system.

## 🚀 Features

### General System Features
- ✅ User account registration and secure login
- ✅ Password reset and email verification
- ✅ User profile management (name, gender, DOB, phone)
- ✅ Role-based access control (Admin, Staff, User)
- ✅ Booking history and activity logs
- ✅ Point system to reward users for room/class bookings
- ✅ Push notifications (Firebase) and email alerts
- ✅ Policy/guideline section (by admin)

### Room Booking Module
- ✅ Room type selection (e.g., Room 1, 2, 3, 4)
- ✅ Date and time slot availability calendar
- ✅ Booking confirmation with status updates
- ✅ Deposit and balance payment workflow
- ✅ Walk-in booking support for staff/admin
- ✅ Automatic notification upon booking success

### Class Booking Module
- ✅ Class listing with detailed descriptions
- ✅ Booking request and approval flow
- ✅ Ask-for-more-info option before confirming
- ✅ Status progression: Pending → Confirmed → Completed
- ✅ Class attendance tracking
- ✅ Reminders via push notifications

### Web Admin Panel
- ✅ Dashboard: total bookings, income, occupancy
- ✅ Admin creation of rooms, classes, schedules
- ✅ User management (add/edit/deactivate accounts)
- ✅ Exportable reports (CSV, PDF)
- ✅ Role management with specific access permissions
- ✅ View and manage activity logs
- ✅ Adjust user points manually (bonus, correction)

### System Integrations
- ✅ Email service integration
- ✅ Firebase push notification setup
- ✅ Payment gateway integration (KBZPay, AYAPay, etc.)
- ✅ Flutter app connection to backend API
- ✅ Booking logic tied with availability, payments, and points

## 🏗️ Architecture

This is a monorepo structure using pnpm workspaces:

```
jPhone-room-class-booking-system/
├── apps/
│   ├── admin/          # React Admin Panel
│   ├── api/            # Express.js Backend API
│   └── workers/        # Background job workers
├── packages/
│   └── shared/         # Shared utilities and types
└── infra/
    └── docker-compose.yml
```

## 🛠️ Tech Stack

### Backend (API)
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MySQL with Prisma ORM
- **Authentication**: JWT with bcrypt
- **Validation**: Zod
- **Logging**: Pino

### Admin Panel
- **Framework**: React 19 with TypeScript
- **Routing**: React Router DOM
- **State Management**: TanStack Query (React Query)
- **Styling**: Tailwind CSS
- **Icons**: Heroicons
- **Notifications**: React Hot Toast

### Database Schema
- **Users**: Authentication, profiles, roles, points
- **Rooms**: Room types, availability, pricing
- **Classes**: Class definitions, schedules, instructors
- **Bookings**: Room and class reservations
- **Payments**: Payment tracking and processing
- **Policies**: System guidelines and rules
- **Analytics**: Activity logs and reporting

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm 8+
- MySQL 8.0+
- Docker (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd jPhone-room-class-booking-system
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy example environment files
   cp apps/api/.env.example apps/api/.env
   cp apps/admin/.env.example apps/admin/.env
   ```

4. **Configure database**
   ```bash
   # Update DATABASE_URL in apps/api/.env
   DATABASE_URL="mysql://username:password@localhost:3306/jphone_booking"
   ```

5. **Run database migrations**
   ```bash
   cd apps/api
   pnpm prisma migrate dev
   pnpm prisma generate
   ```

6. **Start the development servers**
   ```bash
   # Start API server
   cd apps/api
   pnpm dev

   # Start Admin panel (in new terminal)
   cd apps/admin
   pnpm dev
   ```

### Development Scripts

```bash
# Install dependencies
pnpm install

# Start all services in development
pnpm dev

# Build all applications
pnpm build

# Run database migrations
pnpm migrate

# Generate Prisma client
pnpm generate
```

## 📊 API Endpoints

### Authentication
- `POST /v1/auth/register` - User registration
- `POST /v1/auth/login` - User login
- `POST /v1/auth/forgot-password` - Password reset request
- `POST /v1/auth/reset-password` - Password reset
- `GET /v1/auth/me` - Get current user

### Users
- `GET /v1/users` - List users with pagination
- `GET /v1/users/:id` - Get user details
- `POST /v1/users` - Create new user
- `PUT /v1/users/:id` - Update user
- `POST /v1/users/:id/points` - Adjust user points
- `GET /v1/users/:id/points` - Get points history

### Rooms
- `GET /v1/rooms` - List rooms
- `POST /v1/rooms` - Create room
- `PUT /v1/rooms/:id` - Update room
- `DELETE /v1/rooms/:id` - Delete room

### Bookings
- `GET /v1/bookings` - List bookings
- `POST /v1/bookings/rooms/:roomId/book` - Book a room
- `POST /v1/bookings/:id/extend` - Extend booking
- `PUT /v1/bookings/:id` - Update booking status

### Classes
- `GET /v1/classes` - List classes
- `POST /v1/classes` - Create class
- `PUT /v1/classes/:id` - Update class

### Policies
- `GET /v1/policies` - List policies
- `GET /v1/policies/active` - Get active policies
- `POST /v1/policies` - Create policy
- `PUT /v1/policies/:id` - Update policy
- `DELETE /v1/policies/:id` - Delete policy

### Analytics
- `GET /v1/analytics/dashboard` - Dashboard overview
- `GET /v1/analytics/bookings` - Booking analytics
- `GET /v1/analytics/revenue` - Revenue analytics
- `GET /v1/analytics/users` - User analytics
- `GET /v1/analytics/export` - Export data

## 🔐 Authentication & Authorization

The system uses JWT tokens for authentication with role-based access control:

- **Admin**: Full access to all features
- **Staff**: Limited admin access for walk-in bookings
- **User**: Standard booking and profile management

## 📱 Mobile App (Future)

The Flutter mobile app will provide:
- Unified interface for both Android & iOS
- Room & class booking interface
- Real-time booking status and calendar view
- Push notifications for updates
- Profile management and booking history
- Point tracking and rewards view

## 🚀 Deployment

### Production Setup

1. **Build the applications**
   ```bash
   pnpm build
   ```

2. **Set up production environment**
   ```bash
   # Configure production environment variables
   NODE_ENV=production
   DATABASE_URL=production_database_url
   JWT_SECRET=your_jwt_secret
   ```

3. **Deploy using Docker**
   ```bash
   docker-compose -f infra/docker-compose.yml up -d
   ```

### Environment Variables

#### API (.env)
```env
DATABASE_URL="mysql://username:password@localhost:3306/jphone_booking"
JWT_SECRET="your-super-secret-jwt-key"
PORT=3000
NODE_ENV=development
```

#### Admin (.env)
```env
VITE_API_URL="http://localhost:3000"
```

## 📈 Analytics & Reporting

The system provides comprehensive analytics:

- **Dashboard Overview**: Key metrics and recent activity
- **Booking Analytics**: Daily trends, type breakdown, source analysis
- **Revenue Analytics**: Income tracking, payment method analysis
- **User Analytics**: Registration trends, user behavior
- **Export Functionality**: CSV/PDF reports for external analysis

## 🔧 Development

### Code Structure
- **TypeScript**: Full type safety across the stack
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **Husky**: Git hooks for quality checks

### Testing
```bash
# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage
```

### Database Management
```bash
# Create new migration
pnpm prisma migrate dev --name migration_name

# Reset database
pnpm prisma migrate reset

# View database
pnpm prisma studio
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation in the `/docs` folder

## 🗺️ Roadmap

- [ ] Flutter mobile app development
- [ ] Advanced analytics with charts
- [ ] Email notification system
- [ ] Payment gateway integration
- [ ] Multi-language support
- [ ] Advanced reporting features
- [ ] API rate limiting
- [ ] Caching layer
- [ ] Performance optimizations
