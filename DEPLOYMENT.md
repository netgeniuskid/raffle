# Razz Card Game - Deployment Guide

This guide covers how to deploy the Razz Card Game application to various platforms.

## 🐳 Docker Deployment (Recommended)

### Prerequisites
- Docker and Docker Compose installed
- Git (to clone the repository)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd razz
   ```

2. **Deploy with Docker**
   ```bash
   # On Linux/Mac
   chmod +x deploy.sh
   ./deploy.sh
   
   # On Windows
   deploy.bat
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Health Check: http://localhost:3001/health

### Manual Docker Deployment

1. **Build and start services**
   ```bash
   docker-compose up -d --build
   ```

2. **Check service status**
   ```bash
   docker-compose ps
   docker-compose logs -f
   ```

3. **Stop services**
   ```bash
   docker-compose down
   ```

## ☁️ Cloud Deployment Options

### Option 1: Railway

1. **Connect your GitHub repository to Railway**
2. **Set environment variables in Railway dashboard:**
   ```
   DATABASE_URL=file:./prod.db
   JWT_SECRET=your-secure-jwt-secret
   JWT_EXPIRES_IN=30m
   PORT=3001
   NODE_ENV=production
   FRONTEND_URL=https://your-app.railway.app
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app
   NEXT_PUBLIC_ADMIN_KEY=your-admin-key
   ```

3. **Deploy both services separately:**
   - Deploy backend from `/backend` directory
   - Deploy frontend from `/frontend` directory

### Option 2: Render

1. **Create two web services:**
   - Backend service pointing to `/backend`
   - Frontend service pointing to `/frontend`

2. **Set environment variables for backend:**
   ```
   DATABASE_URL=file:./prod.db
   JWT_SECRET=your-secure-jwt-secret
   JWT_EXPIRES_IN=30m
   PORT=3001
   NODE_ENV=production
   FRONTEND_URL=https://your-frontend.onrender.com
   ```

3. **Set environment variables for frontend:**
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
   NEXT_PUBLIC_ADMIN_KEY=your-admin-key
   ```

### Option 3: DigitalOcean App Platform

1. **Create two apps:**
   - Backend app from `/backend` directory
   - Frontend app from `/frontend` directory

2. **Configure environment variables similar to Render**

### Option 4: VPS/Server Deployment

1. **Set up a VPS with Docker**
2. **Clone the repository**
3. **Run the deployment script**
4. **Set up reverse proxy (nginx) for custom domains**
5. **Configure SSL certificates**

## 🔧 Environment Configuration

### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Database
DATABASE_URL="file:./prod.db"

# JWT Configuration
JWT_SECRET="your-super-secure-jwt-secret-here"
JWT_EXPIRES_IN="30m"

# Server Configuration
PORT=3001
NODE_ENV="production"

# CORS
FRONTEND_URL="https://your-domain.com"

# Admin Configuration
ADMIN_KEY="your-secure-admin-key"
```

### Frontend Environment Variables

Create a `.env.local` file in the `frontend` directory:

```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
NEXT_PUBLIC_ADMIN_KEY=your-admin-key
```

## 🗄️ Database Management

The application uses SQLite for simplicity. For production with high traffic, consider:

1. **PostgreSQL migration:**
   - Update `prisma/schema.prisma` datasource
   - Update `DATABASE_URL` environment variable
   - Run migrations

2. **Database backups:**
   - The SQLite file is stored in the Docker volume
   - Regular backups recommended for production

## 🔒 Security Considerations

1. **Change default secrets:**
   - Update `JWT_SECRET` to a secure random string
   - Update `ADMIN_KEY` to a secure value
   - Use environment variables, never commit secrets

2. **HTTPS:**
   - Always use HTTPS in production
   - Update `FRONTEND_URL` and `NEXT_PUBLIC_API_URL` accordingly

3. **CORS:**
   - Configure `FRONTEND_URL` to match your actual frontend domain

## 📊 Monitoring and Logs

1. **View logs:**
   ```bash
   docker-compose logs -f
   docker-compose logs -f backend
   docker-compose logs -f frontend
   ```

2. **Health checks:**
   - Backend: `GET /health`
   - Frontend: Root endpoint

3. **Database access:**
   ```bash
   # Access the container
   docker-compose exec backend sh
   
   # Run Prisma commands
   npx prisma studio
   npx prisma db seed
   ```

## 🚀 Production Checklist

- [ ] Change all default secrets and keys
- [ ] Configure proper CORS settings
- [ ] Set up HTTPS/SSL certificates
- [ ] Configure domain names
- [ ] Set up monitoring and logging
- [ ] Configure database backups
- [ ] Test all functionality
- [ ] Set up CI/CD pipeline (optional)

## 🆘 Troubleshooting

### Common Issues

1. **Port conflicts:**
   - Change ports in `docker-compose.yml` if 3000/3001 are in use

2. **Database issues:**
   - Check if SQLite file has proper permissions
   - Verify `DATABASE_URL` is correct

3. **CORS errors:**
   - Ensure `FRONTEND_URL` matches your frontend domain
   - Check that `NEXT_PUBLIC_API_URL` is correct

4. **Build failures:**
   - Check Docker logs: `docker-compose logs`
   - Ensure all dependencies are installed
   - Verify environment variables are set

### Getting Help

- Check the logs: `docker-compose logs -f`
- Verify environment variables
- Test individual services
- Check network connectivity between services