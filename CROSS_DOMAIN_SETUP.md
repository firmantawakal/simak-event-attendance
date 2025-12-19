# Cross-Subdomain Deployment Guide

This guide explains how to deploy the application with separate subdomains for API and frontend.

## Architecture Overview

### Current Setup
- **Frontend**: `http://event.unidumdev.my.id`
- **API Server**: `http://event-api.unidumdev.my.id`
- **Socket.io**: `http://event-api.unidumdev.my.id`

### Production Configuration

## 1. Frontend Configuration (`client/.env`)

```bash
# API Configuration - Cross-subdomain setup
REACT_APP_API_URL=http://event-api.unidumdev.my.id/api
REACT_APP_SOCKET_URL=http://event-api.unidumdev.my.id

# App Configuration
REACT_APP_NAME=Universitas Dumai - Buku Tamu Digital
REACT_APP_VERSION=1.0.0
REACT_APP_ENV=development
```

## 2. Production Environment (`client/.env.production`)

```bash
# API Configuration - Production HTTPS
REACT_APP_API_URL=https://event-api.unidumdev.my.id/api
REACT_APP_SOCKET_URL=https://event-api.unidumdev.my.id

# App Configuration
REACT_APP_NAME=Universitas Dumai - Buku Tamu Digital
REACT_APP_VERSION=1.0.0
REACT_APP_ENV=production
REACT_APP_BASE_URL=https://event.unidumdev.my.id
```

## 3. Server Configuration (`server/.env`)

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_database_user
DB_PASSWORD=your_secure_password
DB_NAME=simak_event_attendance

# JWT Secret
JWT_SECRET=your_very_secure_jwt_secret_for_production

# Server Configuration
PORT=5001
NODE_ENV=production

# Frontend URL (for CORS) - update to production server URL
FRONTEND_URL=http://event.unidumdev.my.id
```

## 4. CORS Configuration (`server/src/app.js`)

```javascript
// Define allowed origins for both CORS and Socket.io
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://event.unidumdev.my.id',
  'http://event.unidumdev.my.id',           // Frontend subdomain
  'https://event.unidumdev.my.id',          // Frontend subdomain (HTTPS)
  'http://localhost:3000',                  // Development fallback
  'http://localhost:5001',                  // Local fallback
  'http://192.168.18.33:5001'              // Network access (for local development)
];
```

## 5. Client Configuration (`client/src/config/config.js`)

```javascript
// API Configuration - supports cross-subdomain setup
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://event-api.unidumdev.my.id';

// Socket.io Configuration - use the same base as API for cross-subdomain
export const SOCKET_BASE_URL = process.env.REACT_APP_SOCKET_URL || (() => {
  const apiUrl = process.env.REACT_APP_API_URL || 'http://event-api.unidumdev.my.id';
  return apiUrl.replace('/api', '');
})();

// Build URLs dynamically for cross-subdomain setup
export const buildApiUrl = (endpoint) => {
  // Always use the full API URL for cross-subdomain requests
  const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${baseUrl}/${cleanEndpoint}`;
};

export const buildSocketUrl = () => {
  // Always use the full Socket.io URL for cross-subdomain
  return SOCKET_BASE_URL;
};
```

## Deployment Steps

### Step 1: Build for Production

```bash
# Use production environment variables
npm run build
```

### Step 2: Deploy Frontend to `event.unidumdev.my.id`

1. Upload the `client/build` folder to your web server
2. Configure your web server (Apache/Nginx) to serve static files
3. Ensure SSL certificate is installed for HTTPS

### Step 3: Deploy API Server to `event-api.unidumdev.my.id`

1. Upload the server code
2. Install dependencies: `npm install`
3. Configure production environment variables in `.env`
4. Start the server: `npm start`

### Step 4: Configure Reverse Proxy (Recommended)

#### Nginx Configuration Example

```nginx
# Frontend configuration for event.unidumdev.my.id
server {
    listen 80;
    server_name event.unidumdev.my.id;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name event.unidumdev.my.id;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    # Serve React app
    root /path/to/client/build;
    index index.html;

    # Handle React Router
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to backend
    location /api/ {
        proxy_pass http://event-api.unidumdev.my.id:5001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Proxy Socket.io requests
    location /socket.io/ {
        proxy_pass http://event-api.unidumdev.my.id:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Environment Variable Examples

### Development Environment
```bash
# client/.env
REACT_APP_API_URL=http://localhost:5001/api
REACT_APP_SOCKET_URL=http://localhost:5001
```

### Staging Environment
```bash
# client/.env
REACT_APP_API_URL=http://staging-api.unidumdev.my.id/api
REACT_APP_SOCKET_URL=http://staging-api.unidumdev.my.id
```

### Production Environment
```bash
# client/.env.production
REACT_APP_API_URL=https://event-api.unidumdev.my.id/api
REACT_APP_SOCKET_URL=https://event-api.unidumdev.my.id
```

## Testing

### 1. Local Development
```bash
# Start API server on port 5001
cd server && npm start

# Start React app on port 3000
cd client && npm start
```

### 2. Production Testing
- Test frontend: `https://event.unidumdev.my.id`
- Test API: `https://event-api.unidumdev.my.id/api/health`
- Test cross-domain requests and Socket.io connections

## Troubleshooting

### CORS Issues
1. Check `allowedOrigins` array in `server/src/app.js`
2. Verify `FRONTEND_URL` in server `.env`
3. Ensure SSL certificates are properly configured

### Socket.io Connection Issues
1. Verify Socket.io is allowed in CORS configuration
2. Check if reverse proxy properly handles WebSocket connections
3. Test Socket.io connection manually

### API Requests Not Working
1. Check browser console for CORS errors
2. Verify API_BASE_URL in React build
3. Test API endpoints directly with curl

### Environment Variables Not Loading
1. Ensure `.env` files are in correct directories
2. Check that variables start with `REACT_APP_` for client
3. Restart servers after changing environment variables

## Security Considerations

### HTTPS
- Always use HTTPS in production
- Configure proper SSL certificates
- Redirect HTTP to HTTPS

### CORS
- Only allow your specific domains in allowedOrigins
- Consider using environment variables for different environments
- Test CORS configuration thoroughly

### Rate Limiting
- API server already has rate limiting configured
- Adjust limits as needed for production traffic

### Database Security
- Use strong database passwords
- Configure database access restrictions
- Regular database backups

## Monitoring

### Log Monitoring
```bash
# Monitor API server logs
cd server && npm start

# Check for CORS errors
# Look for Socket.io connection logs
# Monitor API request patterns
```

### Performance Monitoring
- Monitor API response times
- Check Socket.io connection health
- Monitor database query performance
- Track error rates and types

This configuration ensures proper separation of concerns while maintaining security and performance across your cross-subdomain setup.