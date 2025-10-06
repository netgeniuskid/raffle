import { Router } from 'express';
import { GameService } from '../services/gameService';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

const router = Router();

/**
 * GET /api/games/:id/state
 * Get current game state (public, no auth required)
 */
router.get('/:id/state', async (req, res, next) => {
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
 * POST /api/games/:id/pick
 * Pick a card (requires authentication)
 */
router.post('/:id/pick', authenticateToken, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const { cardIndex } = req.body;

    if (!cardIndex && cardIndex !== 0) {
      throw createError('Card index is required', 400);
    }

    if (req.gameId !== id) {
      throw createError('Player not in this game', 403);
    }

    const result = await GameService.pickCard(id, req.playerId!, cardIndex);

    if (!result.success) {
      throw createError(result.error || 'Failed to pick card', 400);
    }

    res.json(result.result);
  } catch (error) {
    next(error);
  }
});

export { router as gameRouter };











