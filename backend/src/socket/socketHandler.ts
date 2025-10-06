import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { GameService } from '../services/gameService';
import { ServerToClientEvents, ClientToServerEvents, InterServerEvents, SocketData } from '../types';

const prisma = new PrismaClient();

export const socketHandler = (io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>) => {
  // Middleware to authenticate socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      
      // Verify player exists
      const player = await prisma.player.findUnique({
        where: { id: decoded.playerId },
        include: { game: true }
      });

      if (!player || !player.codeUsed) {
        return next(new Error('Authentication error: Invalid player'));
      }

      socket.data.playerId = player.id;
      socket.data.gameId = player.gameId;
      socket.data.username = player.username;

      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    const { playerId, gameId, username } = socket.data;

    if (!playerId || !gameId || !username) {
      // Defensive guard: middleware should have populated these
      socket.disconnect(true);
      return;
    }

    const playerIdStr: string = playerId;
    const gameIdStr: string = gameId;
    const usernameStr: string = username;

    console.log(`Player ${usernameStr} (${playerIdStr}) connected to game ${gameIdStr}`);

    // Join the game room
    socket.join(`game:${gameIdStr}`);

    // Update player connection status
    try {
      await prisma.player.update({
        where: { id: playerIdStr },
        data: { connected: true }
      });
    } catch (error) {
      console.error('Failed to update player connection status:', error);
      // Continue with connection even if update fails
    }

    // Notify other players
    socket.to(`game:${gameIdStr}`).emit('player:connected', {
      playerId: playerIdStr,
      username: usernameStr
    });

    // Send current game state to the newly connected player
    const gameState = await GameService.getGameState(gameIdStr);
    if (gameState) {
      socket.emit('game:state', gameState);
    }

    // Handle card pick
    socket.on('pick:card', async (data, callback) => {
      try {
        const { cardIndex } = data;

        if (!gameIdStr || !playerIdStr) {
          return callback({ error: 'Not authenticated' });
        }

        const result = await GameService.pickCard(gameIdStr, playerIdStr, cardIndex);

        if (!result.success) {
          return callback({ error: result.error || 'Failed to pick card' });
        }

        // Get game state to include prize names
        const gameState = await GameService.getGameState(gameIdStr);
        const prizeNames = gameState?.prizeNames || [];
        
        // Broadcast the card reveal to all players in the game
        io.to(`game:${gameIdStr}`).emit('card:revealed', {
          cardIndex,
          playerId: playerIdStr,
          wasPrize: result.result!.wasPrize,
          message: result.result!.wasPrize 
            ? `You've Won! ${prizeNames.join(', ')}` 
            : 'Try Again!',
          prizeNames: result.result!.wasPrize ? prizeNames : []
        });

        // If cards were shuffled, broadcast it
        if (result.result!.cardsShuffled) {
          io.to(`game:${gameIdStr}`).emit('cards:shuffled', {
            message: 'Cards have been shuffled!',
            shuffledBy: usernameStr
          });
        }

        // If game ended, broadcast winner
        if (result.result!.gameEnded) {
          io.to(`game:${gameIdStr}`).emit('game:ended', {
            winnerPlayerId: result.result!.winner!.id,
            cardIndex
          });
        } else {
          // Broadcast turn change
          io.to(`game:${gameIdStr}`).emit('turn:changed', {
            currentPlayerIndex: result.result!.nextPlayerIndex!
          });
        }

        // Send updated game state to all players
        const updatedGameState = await GameService.getGameState(gameIdStr);
        if (updatedGameState) {
          io.to(`game:${gameIdStr}`).emit('game:state', updatedGameState);
        }

        callback(result.result);
      } catch (error) {
        console.error('Error handling card pick:', error);
        callback({ error: 'Internal server error' });
      }
    });

    // Handle sync request
    socket.on('request:sync', async (callback) => {
      try {
        if (!gameId) {
          return callback({ error: 'Not authenticated' });
        }

        const gameState = await GameService.getGameState(gameId);
        if (gameState) {
          callback(gameState);
        } else {
          callback({ error: 'Game not found' });
        }
      } catch (error) {
        console.error('Error handling sync request:', error);
        callback({ error: 'Internal server error' });
      }
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`Player ${usernameStr} (${playerIdStr}) disconnected from game ${gameIdStr}`);

      // Update player connection status
      try {
        await prisma.player.update({
          where: { id: playerIdStr },
          data: { connected: false }
        });
      } catch (error) {
        console.error('Failed to update player disconnection status:', error);
        // Continue with disconnection even if update fails
      }

      // Notify other players
      socket.to(`game:${gameIdStr}`).emit('player:disconnected', {
        playerId: playerIdStr,
        username: usernameStr
      });
    });
  });
};




