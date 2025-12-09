# SIMAK - Campus Digital Guestbook Application

A modern digital guestbook application for campus events, built with React.js, Express.js, and MySQL. This application replaces paper-based guestbooks with an electronic system that simplifies attendance tracking and reporting.

## 🚀 Features

### For Guests
- Mobile-friendly attendance form
- QR code scanning support
- Instant confirmation
- No registration required

### For Administrators
- Create and manage events
- Real-time attendance dashboard
- Export data to CSV/Excel
- View statistics and reports
- Search and filter attendance data

## 🛠 Tech Stack

- **Frontend**: React.js 18
- **Backend**: Express.js with Node.js
- **Database**: MySQL
- **Security**: JWT authentication, input validation, rate limiting
- **Development**: Hot reload, ESLint, nodemon

## 📋 Prerequisites

- Node.js 16+
- MySQL 5.7+ or MySQL 8.0+
- Git

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd simak-event-attendance
```

### 2. Install Dependencies

```bash
npm run install-all
```

### 3. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your database configuration:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=simak_attendance

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here

# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 4. Set up Database

Make sure MySQL is running, then run:

```bash
npm run setup:db
```

This will:
- Create the database tables
- Set up proper indexes
- Insert a default admin user (email: `admin@simak.com`, password: `admin123`)
- Create a sample event

### 5. Start Development Servers

```bash
npm run dev
```

This will start both frontend and backend servers:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📁 Project Structure

```
simak-event-attendance/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── api/           # API client
│   │   ├── types/         # TypeScript types
│   │   └── styles/        # CSS styles
│   └── public/            # Static files
├── server/                # Express backend
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── models/        # Database models
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Express middleware
│   │   ├── utils/         # Utility functions
│   │   ├── config/        # Configuration
│   │   └── db/            # Database connection
├── .env.example           # Environment template
├── .gitignore            # Git ignore file
├── package.json          # Root package.json
└── README.md             # This file
```

## 📚 API Documentation

### Events API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/events` | Get all events |
| GET | `/api/events/:id` | Get event by ID |
| GET | `/api/events/slug/:slug` | Get event by slug |
| GET | `/api/events/upcoming` | Get upcoming events |
| POST | `/api/events` | Create new event |
| PUT | `/api/events/:id` | Update event |
| DELETE | `/api/events/:id` | Delete event |

### Attendance API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/attendance` | Record attendance |
| GET | `/api/attendance/event/:id` | Get event attendance |
| GET | `/api/attendance/event/:id/stats` | Get attendance statistics |
| GET | `/api/attendance/event/:id/export` | Export attendance data |
| DELETE | `/api/attendance/:id` | Delete attendance record |

## 🔒 Security Features

- **Input Validation**: All inputs validated using Joi schemas
- **SQL Injection Prevention**: Parameterized queries and input sanitization
- **Rate Limiting**: API endpoints protected from abuse
- **CORS Configuration**: Secure cross-origin requests
- **Helmet**: Security headers for Express.js
- **JWT Authentication**: Secure admin authentication

## 📝 Usage Instructions

### Creating an Event

1. Navigate to `/events/create`
2. Fill in event details:
   - Event name
   - URL slug (auto-generated)
   - Date and time
   - Location
   - Description
3. Save the event
4. Share the generated URL/QR code with guests

### Recording Attendance

1. Guests access the event URL or scan QR code
2. Fill in the attendance form:
   - Guest name (required)
   - Institution (required)
   - Position (optional)
   - Phone (optional)
   - Email (optional)
   - Number of people represented
   - Category
3. Submit to record attendance

### Viewing Reports

1. Navigate to `/events`
2. Click on an event to view its dashboard
3. View statistics, search, filter, and export data

## 🛠 Development

### Available Scripts

```bash
# Install all dependencies
npm run install-all

# Start development servers
npm run dev

# Start only backend
npm run server:dev

# Start only frontend
npm run client:dev

# Build for production
npm run build

# Set up database
npm run setup:db
```

### Database Schema

#### Events Table
- `id`: Primary key
- `name`: Event name
- `slug`: URL-friendly identifier
- `description`: Event description
- `date`: Event date and time
- `location`: Event location
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

#### Attendance Table
- `id`: Primary key
- `event_id`: Foreign key to events
- `guest_name`: Guest's name
- `institution`: Guest's institution
- `position`: Guest's position
- `phone`: Phone number
- `email`: Email address
- `representative_count`: Number of people represented
- `category`: Guest category
- `arrival_time`: Check-in timestamp
- `created_at`: Record creation timestamp

## 🚀 Deployment

### Production Build

```bash
# Build frontend
npm run build

# Set environment variables
export NODE_ENV=production
export DB_HOST=your-production-db-host
export DB_PASSWORD=your-production-db-password

# Start production server
npm start
```

### Environment Variables for Production

```env
NODE_ENV=production
DB_HOST=your-production-host
DB_USER=your-production-user
DB_PASSWORD=your-production-password
DB_NAME=simak_attendance
JWT_SECRET=your-super-secure-jwt-secret
FRONTEND_URL=https://your-domain.com
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Database Connection Issues

1. Ensure MySQL server is running
2. Check database credentials in `.env`
3. Verify database exists: `CREATE DATABASE simak_attendance;`
4. Run `npm run setup:db` to create tables

### Port Already in Use

```bash
# Kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Kill process using port 5000
lsof -ti:5000 | xargs kill -9
```

### Permission Issues

```bash
# Fix node_modules permissions
sudo chown -R $(whoami) node_modules
sudo chown -R $(whoami) client/node_modules
sudo chown -R $(whoami) server/node_modules
```

## 📞 Support

For support and questions, please open an issue on the GitHub repository or contact the development team.