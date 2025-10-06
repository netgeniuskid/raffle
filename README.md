# 🎴 Razz - Card Reveal Game

A full-stack raffle/turn-based card-reveal game app with real-time multiplayer support, admin dashboard, and secure game code authentication.

## ✨ Features

### Admin Dashboard
- Create and configure games with custom card counts and prize settings
- Generate unique one-time game codes for players
- Real-time game monitoring and control
- Export player codes as CSV
- Live game board visualization

### Player Experience
- Join games using secure one-time codes
- Real-time multiplayer gameplay
- Turn-based card picking with live updates
- Beautiful card flip animations
- Live pick history and player status

### Technical Features
- **Real-time Communication**: Socket.IO for instant updates
- **Secure Authentication**: JWT tokens with one-time game codes
- **Database**: PostgreSQL with Prisma ORM
- **Type Safety**: Full TypeScript implementation
- **Responsive Design**: Mobile-friendly UI with Tailwind CSS
- **Docker Support**: Easy deployment with Docker Compose

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker and Docker Compose
- PostgreSQL (if running locally)

### Option 1: Docker Compose (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd razz
   ```

2. **Start the application**
   ```bash
   docker-compose up --build
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Database: localhost:5432

### Option 2: Local Development

1. **Install dependencies**
   ```bash
   # Root dependencies
   npm install
   
   # Backend dependencies
   cd backend && npm install
   
   # Frontend dependencies
   cd ../frontend && npm install
   ```

2. **Set up environment variables**
   ```bash
   # Backend
   cp backend/env.example backend/.env
   # Edit backend/.env with your database URL and JWT secret
   
   # Frontend
   cp frontend/.env.example frontend/.env.local
   # Edit frontend/.env.local with your API URL
   ```

3. **Set up the database**
   ```bash
   cd backend
   npx prisma migrate dev
   npx prisma db seed
   ```

4. **Start the development servers**
   ```bash
   # From root directory
   npm run dev
   ```

## 🎮 How to Play

### For Admins

1. **Create a Game**
   - Go to Admin Dashboard
   - Click "New Game"
   - Configure game settings (cards, prizes, players)
   - Generate player codes

2. **Manage Players**
   - Copy generated codes for players
   - Export codes as CSV for distribution
   - Monitor player connections

3. **Start the Game**
   - Click "Start" when ready
   - Monitor real-time gameplay
   - View game board and pick history

### For Players

1. **Join a Game**
   - Enter your game code
   - Wait in the lobby for game to start

2. **Play the Game**
   - Take turns picking cards
   - Cards reveal either prizes or empty spaces
   - First to find a prize wins!

## 🏗️ Architecture

### Backend (Node.js + Express + TypeScript)
- **API Routes**: RESTful endpoints for game management
- **Socket.IO**: Real-time communication
- **Authentication**: JWT with one-time codes
- **Database**: PostgreSQL with Prisma ORM
- **Security**: Rate limiting, input validation, secure random generation

### Frontend (Next.js + React + TypeScript)
- **Admin Dashboard**: Game creation and management
- **Player Interface**: Real-time gameplay
- **State Management**: React hooks with Socket.IO
- **Styling**: Tailwind CSS with custom animations

### Database Schema
- **Games**: Game configuration and state
- **Players**: Player data with hashed codes
- **Cards**: Card positions and prize status
- **Picks**: Game history and move tracking

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

### Run All Tests
```bash
npm test
```

## 📦 API Documentation

### Authentication
- `POST /api/auth/player/login` - Player login with game code

### Admin Endpoints
- `POST /api/admin/games` - Create new game
- `GET /api/admin/games/:id` - Get game details
- `POST /api/admin/games/:id/start` - Start game
- `POST /api/admin/games/:id/cancel` - Cancel game

### Game Endpoints
- `GET /api/games/:id/state` - Get public game state
- `POST /api/games/:id/pick` - Pick a card (authenticated)

### Socket.IO Events
- `pick:card` - Pick a card
- `request:sync` - Request game state sync
- `game:state` - Game state update
- `card:revealed` - Card reveal notification
- `turn:changed` - Turn change notification
- `game:ended` - Game end notification

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
DATABASE_URL="postgresql://username:password@localhost:5432/razz_game"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="30m"
PORT=3001
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_ADMIN_KEY="admin123"
```

## 🚀 Deployment

### Docker Deployment
```bash
docker-compose up -d
```

### Manual Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set up production database**
   ```bash
   cd backend
   npx prisma migrate deploy
   ```

3. **Start production servers**
   ```bash
   # Backend
   cd backend && npm start
   
   # Frontend
   cd frontend && npm start
   ```

### Cloud Deployment

#### Render
1. Connect your GitHub repository
2. Set environment variables
3. Deploy backend and frontend separately
4. Use managed PostgreSQL

#### Vercel (Frontend)
1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically

#### Railway/Heroku (Backend)
1. Connect GitHub repository
2. Add PostgreSQL addon
3. Set environment variables
4. Deploy

## 🔒 Security Features

- **One-time Codes**: Secure, unguessable game codes
- **JWT Authentication**: Short-lived tokens with refresh
- **Rate Limiting**: Prevent abuse and spam
- **Input Validation**: Zod schema validation
- **SQL Injection Protection**: Prisma ORM
- **CORS Configuration**: Proper cross-origin setup

## 🎨 Customization

### Themes
- Modify `tailwind.config.js` for custom colors
- Update CSS variables in `globals.css`

### Game Rules
- Adjust turn logic in `GameService.pickCard`
- Modify prize distribution in `generatePrizePositions`
- Add custom game modes in the admin interface

### UI Components
- All components are in `frontend/components/`
- Styled with Tailwind CSS
- Fully responsive design

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check DATABASE_URL in .env
   - Ensure PostgreSQL is running
   - Run migrations: `npx prisma migrate dev`

2. **Socket.IO Connection Failed**
   - Check CORS settings
   - Verify FRONTEND_URL in backend .env
   - Check firewall settings

3. **Game Codes Not Working**
   - Ensure codes are generated correctly
   - Check JWT_SECRET is set
   - Verify database has correct data

4. **Build Errors**
   - Clear node_modules and reinstall
   - Check TypeScript errors
   - Verify all environment variables

### Getting Help

- Check the issues section
- Review the API documentation
- Test with the provided seed data

## 🎯 Roadmap

- [ ] Email/SMS code delivery
- [ ] Spectator mode
- [ ] Multiple prize support
- [ ] Game analytics
- [ ] Custom themes
- [ ] Scheduled games
- [ ] Mobile app
- [ ] Tournament mode

---

Built with ❤️ using Next.js, Socket.IO, PostgreSQL, and TypeScript.








