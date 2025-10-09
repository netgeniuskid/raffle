# Vercel Deployment Guide for Razz Card Game

This guide covers deploying the Razz Card Game to Vercel, including both frontend and backend.

## 🚀 Quick Deployment

### Prerequisites
- Vercel account (free tier available)
- GitHub repository with your code
- Domain name (optional, Vercel provides free subdomain)

### Option 1: Deploy Frontend Only (Recommended for MVP)

1. **Connect Repository to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Set **Root Directory** to `frontend`

2. **Configure Environment Variables**
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.vercel.app
   NEXT_PUBLIC_ADMIN_KEY=your-secure-admin-key
   ```

3. **Deploy**
   - Click "Deploy"
   - Vercel will automatically build and deploy

### Option 2: Deploy Both Frontend and Backend

1. **Deploy Backend First**
   - Create new Vercel project
   - Set **Root Directory** to `backend`
   - Configure environment variables:
     ```
     DATABASE_URL=file:./prod.db
     JWT_SECRET=your-super-secure-jwt-secret
     JWT_EXPIRES_IN=30m
     NODE_ENV=production
     FRONTEND_URL=https://your-frontend-url.vercel.app
     ADMIN_KEY=your-secure-admin-key
     ```

2. **Deploy Frontend**
   - Create another Vercel project
   - Set **Root Directory** to `frontend`
   - Configure environment variables:
     ```
     NEXT_PUBLIC_API_URL=https://your-backend-url.vercel.app
     NEXT_PUBLIC_ADMIN_KEY=your-secure-admin-key
     ```

## 🔧 Configuration Details

### Frontend Configuration

The frontend is already configured for Vercel with:
- `vercel.json` - Vercel configuration
- `next.config.js` - Next.js configuration with standalone output
- Environment variables for API URL

### Backend Configuration

For Vercel deployment, the backend uses:
- `api/index.ts` - Serverless function entry point
- `vercel.json` - Vercel configuration
- SQLite database (stored in Vercel's file system)

### Environment Variables

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.vercel.app
NEXT_PUBLIC_ADMIN_KEY=your-secure-admin-key
```

#### Backend (Vercel Environment Variables)
```env
DATABASE_URL=file:./prod.db
JWT_SECRET=your-super-secure-jwt-secret-here
JWT_EXPIRES_IN=30m
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.vercel.app
ADMIN_KEY=your-secure-admin-key
```

## 📁 Project Structure for Vercel

```
razz/
├── frontend/                 # Frontend deployment
│   ├── vercel.json
│   ├── next.config.js
│   └── ...
├── backend/                  # Backend deployment
│   ├── api/
│   │   └── index.ts         # Serverless entry point
│   ├── vercel.json
│   └── ...
└── vercel.json              # Root configuration (optional)
```

## 🚀 Step-by-Step Deployment

### Step 1: Prepare Your Repository

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Add Vercel deployment configuration"
   git push origin main
   ```

### Step 2: Deploy Backend

1. **Go to Vercel Dashboard**
   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"

2. **Import Repository**
   - Select your GitHub repository
   - Click "Import"

3. **Configure Backend Project**
   - **Project Name**: `razz-backend` (or your preferred name)
   - **Root Directory**: `backend`
   - **Framework Preset**: Other
   - **Build Command**: `npm run build`
   - **Output Directory**: Leave empty
   - **Install Command**: `npm install`

4. **Set Environment Variables**
   - Go to Settings → Environment Variables
   - Add all backend environment variables

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Note the deployment URL (e.g., `https://razz-backend.vercel.app`)

### Step 3: Deploy Frontend

1. **Create New Project**
   - Click "New Project" again
   - Import the same repository

2. **Configure Frontend Project**
   - **Project Name**: `razz-frontend` (or your preferred name)
   - **Root Directory**: `frontend`
   - **Framework Preset**: Next.js (auto-detected)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

3. **Set Environment Variables**
   - `NEXT_PUBLIC_API_URL`: Your backend URL from Step 2
   - `NEXT_PUBLIC_ADMIN_KEY`: Same admin key as backend

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete

### Step 4: Configure Custom Domain (Optional)

1. **Add Domain to Frontend Project**
   - Go to your frontend project settings
   - Click "Domains"
   - Add your custom domain
   - Follow DNS configuration instructions

2. **Add Domain to Backend Project**
   - Go to your backend project settings
   - Click "Domains"
   - Add your API subdomain (e.g., `api.yourdomain.com`)

## 🔄 Updates and Maintenance

### Updating Your Application

1. **Push changes to GitHub**
   ```bash
   git add .
   git commit -m "Update application"
   git push origin main
   ```

2. **Vercel will automatically redeploy**
   - Both frontend and backend will rebuild
   - New deployments will be available in a few minutes

### Environment Variable Updates

1. **Go to Project Settings**
2. **Navigate to Environment Variables**
3. **Update the values**
4. **Redeploy** (or wait for next deployment)

## 🛠️ Vercel-Specific Features

### Serverless Functions
- Backend runs as serverless functions
- Automatic scaling based on demand
- No server management required

### Edge Functions
- Frontend can use Vercel Edge Functions
- Global CDN for fast loading
- Automatic HTTPS

### Analytics
- Built-in analytics for both projects
- Performance monitoring
- Error tracking

## 🚨 Limitations and Considerations

### SQLite Database
- **Limitation**: SQLite on Vercel is read-only in production
- **Solution**: Consider upgrading to a database service like:
  - Vercel Postgres
  - PlanetScale
  - Supabase
  - Railway

### Socket.IO
- **Limitation**: Socket.IO doesn't work well with serverless functions
- **Solution**: Consider alternatives like:
  - Vercel's real-time features
  - Pusher
  - Ably
  - Or remove real-time features for MVP

### File Storage
- **Limitation**: No persistent file storage
- **Solution**: Use external storage like:
  - Vercel Blob
  - AWS S3
  - Cloudinary

## 🔧 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check build logs in Vercel dashboard
   - Ensure all dependencies are in package.json
   - Verify TypeScript compilation

2. **Environment Variables**
   - Double-check variable names and values
   - Ensure variables are set for correct environment (Production)

3. **Database Issues**
   - SQLite may not work in production
   - Consider migrating to a cloud database

4. **CORS Issues**
   - Update FRONTEND_URL in backend environment variables
   - Check CORS configuration in backend code

### Debugging

1. **View Logs**
   - Go to project dashboard
   - Click "Functions" tab
   - View function logs

2. **Test Locally**
   ```bash
   # Test frontend
   cd frontend
   npm run dev
   
   # Test backend
   cd backend
   npm run dev
   ```

## 📊 Monitoring

### Vercel Analytics
- Built-in performance monitoring
- Real-time analytics
- Error tracking

### Custom Monitoring
- Add logging to your application
- Use external monitoring services
- Set up alerts for errors

## 💰 Pricing

### Free Tier
- 100GB bandwidth per month
- 100 serverless function executions per day
- Unlimited static deployments

### Pro Tier ($20/month)
- 1TB bandwidth per month
- 1M serverless function executions per month
- Advanced analytics
- Custom domains

## 🎉 Success!

Once deployed, your Razz Card Game will be available at:
- **Frontend**: `https://your-frontend-project.vercel.app`
- **Backend**: `https://your-backend-project.vercel.app`

The application will automatically scale and handle traffic spikes, with global CDN for fast loading worldwide!
