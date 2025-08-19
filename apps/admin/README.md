# JPhoniex Admin Panel

A comprehensive admin panel for managing room bookings, classes, users, and more.

## Features

### Room Management
- **Room Types**: Create and manage different categories of rooms (Conference, Meeting, Training, Private Office)
- **Room Management**: Full CRUD operations for rooms with features like:
  - Capacity management
  - Status tracking (Available/Maintenance)
  - Floor assignment
  - Hourly pricing
  - Feature tags (projector, whiteboard, video conference, etc.)
- **Availability Checking**: Real-time room availability checking
- **Search & Filtering**: Advanced search with status and type filters
- **Pagination**: Efficient data loading with pagination

### User Management
- User registration and authentication
- Role-based access control
- User status management

### Booking System
- Room and class booking management
- Booking status tracking
- Conflict detection

### Class Management
- Class creation and scheduling
- Instructor assignment
- Room allocation

## Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm
- MySQL database

### Installation

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Set up the database:**
   ```bash
   cd apps/api
   pnpm prisma migrate dev
   pnpm prisma generate
   ```

3. **Seed the database:**
   ```bash
   pnpm seed
   ```

4. **Start the API server:**
   ```bash
   cd apps/api
   pnpm dev
   ```

5. **Start the admin panel:**
   ```bash
   cd apps/admin
   pnpm dev
   ```

### Default Login Credentials
- **Email**: admin@jphone.com
- **Password**: admin123

## API Endpoints

### Room Management
- `GET /v1/rooms` - List all rooms with pagination and filtering
- `POST /v1/rooms` - Create a new room
- `GET /v1/rooms/:id` - Get room details with bookings
- `PUT /v1/rooms/:id` - Update room information
- `DELETE /v1/rooms/:id` - Delete a room (if no active bookings)
- `GET /v1/rooms/:id/availability` - Check room availability

### Room Types
- `GET /v1/rooms/types` - List all room types
- `POST /v1/rooms/types` - Create a new room type
- `PUT /v1/rooms/types/:id` - Update room type
- `DELETE /v1/rooms/types/:id` - Delete room type (if not in use)

## Database Schema

The system uses Prisma with MySQL and includes models for:
- Users and authentication
- Rooms and room types
- Classes and schedules
- Bookings and payments
- Policies and events

## Features

### Responsive Design
- Mobile-first approach
- Collapsible sidebar navigation
- Modern UI components with Tailwind CSS

### Real-time Updates
- Live data fetching
- Optimistic updates
- Error handling and validation

### Security
- JWT authentication
- Input validation with Zod
- SQL injection protection
- CORS configuration

## Development

### Tech Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS, Heroicons
- **Backend**: Node.js, Express, Prisma, MySQL
- **Authentication**: JWT with bcrypt
- **Validation**: Zod schema validation

### Project Structure
```
apps/
├── admin/          # React admin panel
├── api/            # Express API server
└── workers/        # Background job workers

packages/
└── shared/         # Shared utilities and types
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.
