import { Router } from 'express';
import { GameService } from '../services/gameService';
import { createError } from '../middleware/errorHandler';

const router = Router();

/**
 * POST /api/auth/player/login
 * Player login with game code
 */
router.post('/player/login', async (req, res, next) => {
  try {
    const { code } = req.body;

    if (!code) {
      throw createError('Game code is required', 400);
    }

    const result = await GameService.playerLogin(code);

    if (!result) {
      throw createError('Invalid game code', 401);
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
});

export { router as authRouter };











