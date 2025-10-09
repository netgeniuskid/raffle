// Simple Express server for Vercel
const express = require('express');
const cors = require('cors');

const app = express();

// CORS middleware
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'x-admin-key']
}));

app.use(express.json());

// Simple in-memory storage (in production, this would be a database)
let games = new Map();
let playerCodes = new Map();

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString() 
  });
});

// Admin games endpoint
app.get('/api/admin/games', (req, res) => {
  const gamesList = Array.from(games.values());
  res.json({ games: gamesList });
});

app.post('/api/admin/games', (req, res) => {
  const gameId = Math.random().toString(36).substr(2, 9);
  const game = { 
    id: gameId, 
    name: req.body.name || 'Test Game',
    status: 'DRAFT',
    totalCards: req.body.totalCards || 20,
    prizeCount: req.body.prizeCount || 3,
    playerSlots: req.body.playerSlots || 4,
    createdAt: new Date().toISOString(),
    cards: [],
    players: [],
    currentPlayerIndex: 0,
    picks: []
  };
  
  // Generate player codes
  const codes = Array.from({ length: req.body.playerSlots || 4 }, (_, i) => ({
    username: `Player ${i + 1}`,
    code: Math.random().toString(36).substr(2, 6).toUpperCase()
  }));
  
  // Store the game and codes
  games.set(gameId, game);
  playerCodes.set(gameId, codes);
  
  res.json({ 
    game,
    playerCodes: codes
  });
});

// Start game endpoint
app.post('/api/admin/games/:gameId/start', (req, res) => {
  const gameId = req.params.gameId;
  const game = games.get(gameId);
  
  if (!game) {
    return res.status(404).json({ error: 'Game not found' });
  }
  
  // Create cards for the game
  const cards = Array.from({ length: game.totalCards }, (_, i) => ({
    id: `card-${i}`,
    positionIndex: i,
    isRevealed: false,
    isPrize: i < game.prizeCount,
    prizeNames: i < game.prizeCount ? [`Prize ${i + 1}`] : []
  }));
  
  // Update the game
  const updatedGame = {
    ...game,
    status: 'IN_PROGRESS',
    cards: cards
  };
  
  games.set(gameId, updatedGame);
  
  res.json({ game: updatedGame });
});

// Delete game endpoint
app.delete('/api/admin/games/:gameId', (req, res) => {
  const gameId = req.params.gameId;
  const game = games.get(gameId);
  
  if (!game) {
    return res.status(404).json({ error: 'Game not found' });
  }
  
  // Remove the game and its player codes
  games.delete(gameId);
  playerCodes.delete(gameId);
  
  res.json({ message: 'Game deleted successfully' });
});

// Cancel game endpoint
app.post('/api/admin/games/:gameId/cancel', (req, res) => {
  const gameId = req.params.gameId;
  const game = games.get(gameId);
  
  if (!game) {
    return res.status(404).json({ error: 'Game not found' });
  }
  
  // Update the game status to cancelled
  const updatedGame = {
    ...game,
    status: 'CANCELLED'
  };
  
  games.set(gameId, updatedGame);
  
  res.json({ message: 'Game cancelled successfully' });
});

// Player login endpoint
app.post('/api/auth/player/login', (req, res) => {
  const { code } = req.body;
  
  if (!code) {
    return res.status(400).json({ error: { message: 'Game code is required' } });
  }
  
  // Find the game by player code
  let gameId = null;
  let playerCodeData = null;
  
  for (const [id, codes] of playerCodes.entries()) {
    const foundCode = codes.find(c => c.code === code);
    if (foundCode) {
      gameId = id;
      playerCodeData = foundCode;
      break;
    }
  }
  
  if (!gameId) {
    return res.status(400).json({ error: { message: 'Invalid game code' } });
  }
  
  const game = games.get(gameId);
  if (!game) {
    return res.status(404).json({ error: { message: 'Game not found' } });
  }
  
  // Create player
  const player = {
    id: Math.random().toString(36).substr(2, 9),
    username: playerCodeData.username,
    playerIndex: game.players.length,
    connected: true
  };
  
  // Add player to game if not already added
  const existingPlayer = game.players.find(p => p.username === player.username);
  if (!existingPlayer) {
    game.players.push(player);
    games.set(gameId, game);
  }
  
  const token = Math.random().toString(36).substr(2, 20);
  
  res.json({
    token,
    player: existingPlayer || player,
    game
  });
});

// Catch all handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

module.exports = app;