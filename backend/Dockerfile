FROM node:18-alpine

WORKDIR /app

# Copy root package files
COPY package*.json ./

# Copy backend package files
COPY backend/package*.json ./backend/

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build:backend

# Generate Prisma client after build
RUN cd backend && npx prisma generate

# Ensure Prisma client is available
RUN ls -la backend/node_modules/.prisma/client/ || echo "Prisma client not found"

# Remove dev dependencies to reduce image size
RUN npm prune --production

# Expose port
EXPOSE 3001

# Start the application
CMD ["npm", "run", "start:backend"]











