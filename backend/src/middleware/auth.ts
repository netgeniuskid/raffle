import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { createError } from './errorHandler';

const prisma = new PrismaClient();

export interface AuthRequest extends Request {
  playerId?: string;
  gameId?: string;
  username?: string;
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      throw createError('Access token required', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Verify player still exists and is valid
    const player = await prisma.player.findUnique({
      where: { id: decoded.playerId },
      include: { game: true }
    });

    if (!player) {
      throw createError('Invalid token - player not found', 401);
    }

    if (!player.codeUsed) {
      throw createError('Invalid token - code not used', 401);
    }

    req.playerId = player.id;
    req.gameId = player.gameId;
    req.username = player.username;

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(createError('Invalid token', 401));
    } else {
      next(error);
    }
  }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  // Simple admin check via shared key header
  const adminKeyHeader = (req.headers['x-admin-key'] as string) || (req.headers['X-Admin-Key'] as string);
  const expectedKey = process.env.ADMIN_KEY || process.env.NEXT_PUBLIC_ADMIN_KEY || 'admin123';

  if (!adminKeyHeader || adminKeyHeader !== expectedKey) {
    return next(createError('Admin access required', 403));
  }

  next();
};

