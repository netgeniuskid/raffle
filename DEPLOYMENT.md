# 🚀 Deployment Guide

## Quick Deploy with Railway (Recommended)

### 1. Prepare for Production
```bash
# Switch to PostgreSQL for production
# In backend/prisma/schema.prisma, uncomment the PostgreSQL datasource:
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 2. Deploy to Railway
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your `netgeniuskid/raffle` repository
5. Railway will automatically detect it's a monorepo

### 3. Configure Services
Railway will create two services:
- **Backend Service** (Node.js)
- **Frontend Service** (Next.js)

### 4. Add Database
1. In Railway dashboard, click "New" → "Database" → "PostgreSQL"
2. Connect it to your backend service

### 5. Set Environment Variables

**Backend Environment Variables:**
- `JWT_SECRET`: Generate a secure random string
- `JWT_EXPIRES_IN`: `30m`
- `NODE_ENV`: `production`
- `FRONTEND_URL`: `https://your-frontend-url.railway.app`
- `DATABASE_URL`: (Automatically set by Railway)

**Frontend Environment Variables:**
- `NEXT_PUBLIC_API_URL`: `https://your-backend-url.railway.app`
- `NEXT_PUBLIC_ADMIN_KEY`: `admin123`

### 6. Deploy
Railway will automatically build and deploy both services!

## Alternative: Vercel + Railway

### Frontend (Vercel)
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Set build command: `cd frontend && npm run build`
4. Set output directory: `frontend/.next`
5. Add environment variables:
   - `NEXT_PUBLIC_API_URL`: Your Railway backend URL
   - `NEXT_PUBLIC_ADMIN_KEY`: `admin123`

### Backend (Railway)
1. Deploy backend to Railway (steps above)
2. Use PostgreSQL database
3. Set environment variables as listed above

## Testing Your Deployment

Once deployed, you can:
1. **Share the frontend URL** with others
2. **Test the demo game** with the seeded player codes
3. **Create new games** through the admin interface
4. **Test real-time features** with multiple users

## Demo Game Codes
- Alice: `29E546DD`
- Bob: `3D508230`
- Carol: `23A15C6E`
- Dave: `326DA81C`
- Eve: `4C08F821`
- Frank: `4BD11428`

## Troubleshooting

### Database Issues
- Make sure to switch to PostgreSQL in production
- Run `prisma db push` after switching datasource
- Check Railway logs for database connection errors

### CORS Issues
- Ensure `FRONTEND_URL` is set correctly in backend
- Include the full URL with `https://`

### Socket.io Issues
- Check that both frontend and backend are using the same domain
- Verify WebSocket connections are not blocked by firewall
