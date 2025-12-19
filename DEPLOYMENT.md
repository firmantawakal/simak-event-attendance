# Deployment Guide

This guide explains how to configure the application for deployment on different environments (development, staging, production).

## Environment Configuration

### 1. Client Configuration

The client uses environment variables to configure API endpoints and application settings.

#### Development (`client/.env`)

```bash
# API Configuration
REACT_APP_API_URL=http://localhost:5001/api

# App Configuration
REACT_APP_NAME=Universitas Dumai - Buku Tamu Digital
REACT_APP_VERSION=1.0.0
REACT_APP_ENV=development
```

#### Production (`client/.env.production`)

Create `client/.env.production` for production builds:

```bash
# API Configuration - replace with your actual domain
REACT_APP_API_URL=https://your-domain.com/api

# App Configuration
REACT_APP_NAME=Universitas Dumai - Buku Tamu Digital
REACT_APP_VERSION=1.0.0
REACT_APP_ENV=production
REACT_APP_BASE_URL=https://your-domain.com
```

### 2. Server Configuration

The server uses environment variables for database, API, and server settings.

#### Development (`server/.env`)

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=123456
DB_NAME=simak_event_attendance

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here

# Server Configuration
PORT=5001
NODE_ENV=production

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5001
```

#### Production (`server/.env`)

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_database_user
DB_PASSWORD=your_secure_password
DB_NAME=simak_event_attendance

# JWT Secret - generate a secure secret!
JWT_SECRET=your_very_secure_jwt_secret_for_production

# Server Configuration
PORT=5001
NODE_ENV=production

# Frontend URL - replace with your actual domain
FRONTEND_URL=https://your-domain.com
```

## Deployment Scenarios

### 1. Local Network Deployment

For access within your local network (other computers on same network):

```bash
# Client (.env)
REACT_APP_API_URL=http://192.168.1.100:5001/api

# Server (.env)
PORT=5001
NODE_ENV=production
FRONTEND_URL=http://192.168.1.100:5001
```

### 2. Domain Deployment

For deployment with a custom domain:

```bash
# Client (.env.production)
REACT_APP_API_URL=https://events.universitas-dumai.ac.id/api
REACT_APP_BASE_URL=https://events.universitas-dumai.ac.id

# Server (.env)
PORT=5001
NODE_ENV=production
FRONTEND_URL=https://events.universitas-dumai.ac.id
```

### 3. Subdirectory Deployment

For deployment in a subdirectory:

```bash
# Client (.env.production)
REACT_APP_API_URL=https://your-domain.com/events/api
REACT_APP_BASE_URL=https://your-domain.com/events

# Server (.env)
PORT=5001
NODE_ENV=production
FRONTEND_URL=https://your-domain.com/events
```

## Deployment Steps

### 1. Prepare Environment Files

1. Copy the template files:
   ```bash
   cp server/.env.example server/.env
   cp client/.env.production.example client/.env.production
   ```

2. Edit the copied files with your actual values

### 2. Build for Production

```bash
# Build React app
npm run build

# The build will automatically use client/.env.production
```

### 3. Database Setup

```bash
cd server
npm run setup:db
```

### 4. Start Production Server

```bash
cd server
npm start
```

## Important Notes

### Security

- **Never commit `.env` files** to version control
- Use strong passwords for production database
- Generate a secure JWT secret: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
- Enable HTTPS in production

### Network Configuration

- The server is configured to bind to `0.0.0.0` for network access
- Ensure firewall allows traffic on your specified port (default: 5001)
- Configure reverse proxy (Nginx/Apache) for production if needed

### Environment Variables Reference

#### Client Variables (must start with `REACT_APP_`)

| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Base URL for API requests | `https://your-domain.com/api` |
| `REACT_APP_BASE_URL` | Base URL for the application | `https://your-domain.com` |
| `REACT_APP_NAME` | Application name | `Universitas Dumai - Buku Tamu Digital` |
| `REACT_APP_VERSION` | Application version | `1.0.0` |
| `REACT_APP_ENV` | Environment (development/production) | `production` |

#### Server Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5001` |
| `NODE_ENV` | Environment | `production` |
| `FRONTEND_URL` | Frontend URL for CORS | `https://your-domain.com` |
| `DB_HOST` | Database host | `localhost` |
| `DB_PORT` | Database port | `3306` |
| `DB_USER` | Database username | `app_user` |
| `DB_PASSWORD` | Database password | `secure_password` |
| `DB_NAME` | Database name | `simak_event_attendance` |
| `JWT_SECRET` | JWT signing secret | `your_64_byte_hex_secret` |

## Testing Deployment

1. **Local Test**: Access `http://localhost:5001`
2. **Network Test**: Access `http://YOUR_IP:5001` from other devices
3. **Domain Test**: Access `https://your-domain.com` after DNS setup
4. **API Test**: Check `http://localhost:5001/health` returns OK

## Troubleshooting

### API Not Working
- Check `REACT_APP_API_URL` in client environment
- Verify server is running and accessible
- Check CORS configuration in server

### Static Files Not Loading
- Ensure React app is built: `npm run build`
- Verify static file serving in server configuration
- Check build folder exists and has correct files

### Database Connection Issues
- Verify database credentials in server environment
- Ensure database server is running
- Check database exists and user has permissions

### Socket.io Not Working
- Verify socket base URL configuration
- Check firewall allows WebSocket connections
- Ensure server and client URLs match