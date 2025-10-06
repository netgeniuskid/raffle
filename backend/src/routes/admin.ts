import { Router } from 'express';
import { GameService } from '../services/gameService';
import { createError } from '../middleware/errorHandler';
import { requireAdmin } from '../middleware/auth';

const router = Router();

// All admin routes require admin authentication
router.use(requireAdmin);

/**
 * POST /api/admin/games
 * Create a new game
 */
router.post('/games', async (req, res, next) => {
  try {
    const gameData = req.body;

    // Validate required fields
    const { name, totalCards, prizeCount, playerSlots } = gameData;
    if (!name || !totalCards || !prizeCount || !playerSlots) {
      throw createError('Missing required fields: name, totalCards, prizeCount, playerSlots', 400);
    }

    const result = await GameService.createGame(gameData);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/games
 * List games (basic list without cards)
 */
router.get('/games', async (req, res, next) => {
  try {
    const games = await GameService.listGames();
    res.json({ games });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/games/:id
 * Get game details
 */
router.get('/games/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const gameState = await GameService.getGameState(id);

    if (!gameState) {
      throw createError('Game not found', 404);
    }

    res.json({ game: gameState });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/games/:id/start
 * Start a game
 */
router.post('/games/:id/start', async (req, res, next) => {
  try {
    const { id } = req.params;
    const gameState = await GameService.startGame(id);

    res.json({ game: gameState });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/games/:id/cancel
 * Cancel a game
 */
router.post('/games/:id/cancel', async (req, res, next) => {
  try {
    const { id } = req.params;
    // TODO: Implement cancel game logic
    res.json({ message: 'Game cancelled' });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/admin/games/:id
 * Delete a game and all related data
 */
router.delete('/games/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Use cascading deletes defined in Prisma relations
    await GameService.deleteGame(id);

    res.json({ message: 'Game deleted' });
  } catch (error) {
    next(error);
  }
});

export { router as adminRouter };



