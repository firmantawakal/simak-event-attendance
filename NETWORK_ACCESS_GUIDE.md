# Network Access Setup Guide

This guide explains how the application is configured for network access and how to update it for different deployment scenarios.

## Current Configuration

### Server Details
- **IP Address**: `192.168.18.33`
- **Port**: `5001`
- **Access URL**: `http://192.168.18.33:5001`

### Current Status: ✅ FIXED

The blank white page issue has been resolved by:
1. **Updated Client API URL**: Now uses IP address instead of localhost
2. **Fixed CORS Configuration**: Server now accepts requests from multiple origins
3. **Updated Socket.io CORS**: Real-time connections work from network devices

## Access URLs

### Local Access (from server machine)
- Homepage: `http://localhost:5001/`
- Event Form: `http://localhost:5001/attend/event-slug`
- Admin Login: `http://localhost:5001/login`

### Network Access (from other devices)
- Homepage: `http://192.168.18.33:5001/`
- Event Form: `http://192.168.18.33:5001/attend/event-slug`
- Admin Login: `http://192.168.18.33:5001/login`

## Configuration Files

### Client Configuration (`client/.env`)
```bash
# API Configuration - UPDATED for network access
REACT_APP_API_URL=http://192.168.18.33:5001/api

# App Configuration
REACT_APP_NAME=Universitas Dumai - Buku Tamu Digital
REACT_APP_VERSION=1.0.0
REACT_APP_ENV=production
```

### Server Configuration (`server/.env`)
```bash
# Server Configuration
PORT=5001
NODE_ENV=production

# Frontend URL (for CORS) - UPDATED for network access
FRONTEND_URL=http://192.168.18.33:5001
```

### Server CORS Configuration (`server/src/app.js`)
```javascript
// Define allowed origins for both CORS and Socket.io
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5001',
  'http://localhost:5001',    // Local access
  'http://localhost:3000',    // Development fallback
  'http://192.168.18.33:5001' // Network access
];
```

## How to Update for Different Networks

### 1. Changing IP Address

If your server IP changes, update these files:

**Step 1: Update Client Environment**
```bash
# Edit client/.env
REACT_APP_API_URL=http://NEW_IP:5001/api
```

**Step 2: Update Server Environment**
```bash
# Edit server/.env
FRONTEND_URL=http://NEW_IP:5001
```

**Step 3: Update Server CORS Configuration**
```bash
# Edit server/src/app.js
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5001',
  'http://localhost:5001',
  'http://localhost:3000',
  'http://NEW_IP:5001'  // Update this line
];
```

**Step 4: Rebuild and Restart**
```bash
# Rebuild React app with new configuration
npm run build

# Restart server to apply changes
# Kill current server and restart:
cd server && npm start
```

### 2. Adding Multiple Network Origins

To allow access from multiple IPs/networks:

```javascript
const allowedOrigins = [
  'http://localhost:5001',
  'http://localhost:3000',
  'http://192.168.18.33:5001',  // Current network
  'http://192.168.18.50:5001',  // Additional network
  'http://10.0.0.100:5001'      // Another network
];
```

## Troubleshooting

### Blank White Page
**✅ FIXED**: This was caused by:
- Client trying to connect to `localhost:5001/api` from network devices
- Server not allowing CORS requests from network IP

**Solution**: Update `REACT_APP_API_URL` to use server IP address

### CORS Errors
**✅ FIXED**: Server was only allowing requests from localhost.

**Solution**: Updated CORS configuration to allow multiple origins

### Socket.io Connection Issues
**✅ FIXED**: Socket.io CORS was also restricted to localhost.

**Solution**: Updated socket.io CORS to match API CORS origins

### API Calls Not Working
**✅ FIXED**: Network devices couldn't reach API endpoints.

**Solution**: Updated both client API URL and server CORS configuration

## Testing Network Access

### From Command Line
```bash
# Test API accessibility
curl http://192.168.18.33:5001/api/events

# Test frontend
curl -I http://192.168.18.33:5001/

# Test specific event form
curl -I http://192.168.18.33:5001/attend/test-event
```

### From Browser
1. Open browser on another device on the same network
2. Navigate to `http://192.168.18.33:5001`
3. Test different routes:
   - `http://192.168.18.33:5001/login`
   - `http://192.168.18.33:5001/events`
   - `http://192.168.18.33:5001/attend/test-event`

## Security Considerations

### Current Setup
- **CORS**: Restricted to specific origins only
- **Network Access**: Available to any device on the same network
- **No HTTPS**: HTTP only (suitable for local network)

### For Production Deployment
1. **Use HTTPS**: Configure SSL/TLS certificates
2. **Firewall Rules**: Restrict access to specific IPs if needed
3. **Domain Name**: Use domain instead of IP address
4. **VPN Access**: Consider VPN for remote access instead of public exposure

### Example Production Configuration
```bash
# Client (.env.production)
REACT_APP_API_URL=https://events.universitas-dumai.ac.id/api

# Server (.env)
FRONTEND_URL=https://events.universitas-dumai.ac.id
NODE_ENV=production
PORT=443  # HTTPS port
```

## Current Working Features

✅ **Direct URL Access**: Works from any device on network
✅ **API Calls**: Function correctly from network devices
✅ **Real-time Updates**: Socket.io connections work
✅ **CORS Configuration**: Properly configured for network access
✅ **Static File Serving**: React build files served correctly
✅ **Event Forms**: Accessible via direct URLs
✅ **Admin Panel**: Accessible from network devices

The application is now fully functional for network access! 🎉