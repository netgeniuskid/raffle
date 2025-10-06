import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt, { type SignOptions, type Secret } from 'jsonwebtoken';
import { GameState, PlayerState, CardState, CreateGameRequest, CreateGameResponse } from '../types';

const prisma = new PrismaClient();

export class GameService {
  /**
   * Generate a secure random game code
   */
  private static generateGameCode(): string {
    return crypto.randomBytes(4).toString('hex').toUpperCase();
  }

  /**
   * Create a new game with players and cards
   */
  static async createGame(data: CreateGameRequest): Promise<CreateGameResponse> {
    const { name, totalCards, prizeCount, prizeNames, playerSlots, seed } = data;

    // Validate input
    if (prizeCount < 1 || prizeCount >= totalCards) {
      throw new Error('Prize count must be at least 1 and less than total cards');
    }

    if (playerSlots < 2) {
      throw new Error('Must have at least 2 players');
    }

    // Generate prize positions (server-side only)
    const prizePositions = this.generatePrizePositions(totalCards, prizeCount, seed);
    const encryptedPrizePositions = this.encryptPrizePositions(prizePositions);

    // Create game
    const game = await prisma.game.create({
      data: {
        name,
        totalCards,
        prizeCount,
        prizeNames: prizeNames ? JSON.stringify(prizeNames) : null,
        playerSlots,
        status: "DRAFT",
        prizePositions: encryptedPrizePositions,
      },
    });

    // Create cards
    const cards = await Promise.all(
      Array.from({ length: totalCards }, (_, index) =>
        prisma.card.create({
          data: {
            gameId: game.id,
            positionIndex: index,
            isPrize: prizePositions.includes(index),
          },
        })
      )
    );

    // Generate player codes
    const playerCodes = Array.from({ length: playerSlots }, (_, index) => ({
      username: `Player ${index + 1}`,
      code: this.generateGameCode(),
    }));

    // Create players with hashed codes
    const players = await Promise.all(
      playerCodes.map(async ({ username, code }, index) => {
        const hashedCode = await bcrypt.hash(code, 10);
        return prisma.player.create({
          data: {
            gameId: game.id,
            username,
            code: hashedCode,
            playerIndex: index,
          },
        });
      })
    );

    return {
      game: this.mapGameToState(game, players, cards),
      playerCodes: playerCodes.map(({ code }, index) => ({
        username: players[index].username,
        code,
      })),
    };
  }

  /**
   * Delete a game and all related data
   */
  static async deleteGame(gameId: string): Promise<void> {
    // Cascades are defined in Prisma schema; deleting the game removes children
    await prisma.game.delete({ where: { id: gameId } });
  }

  /**
   * Get game state by ID
   */
  static async getGameState(gameId: string): Promise<GameState | null> {
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        players: { orderBy: { playerIndex: 'asc' } },
        cards: { orderBy: { positionIndex: 'asc' } },
      },
    });

    if (!game) return null;

    return this.mapGameToState(game, game.players, game.cards);
  }

  /**
   * List games (without heavy relations)
   */
  static async listGames(): Promise<Array<Pick<GameState, 'id' | 'name' | 'totalCards' | 'prizeCount' | 'playerSlots' | 'status' | 'createdAt'>>> {
    const games = await prisma.game.findMany({
      orderBy: { createdAt: 'desc' },
      include: { players: true },
    });

    return games.map(g => ({
      id: g.id,
      name: g.name,
      totalCards: g.totalCards,
      prizeCount: g.prizeCount,
      playerSlots: g.playerSlots,
      status: g.status as GameState['status'],
      // minimal fields for list; createdAt as ISO string
      createdAt: g.createdAt.toISOString(),
    }));
  }

  /**
   * Start a game
   */
  static async startGame(gameId: string): Promise<GameState> {
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: { players: true },
    });

    if (!game) {
      throw new Error('Game not found');
    }

    if (game.status !== "DRAFT" && game.status !== "WAITING") {
      throw new Error('Game cannot be started in current status');
    }

    const updatedGame = await prisma.game.update({
      where: { id: gameId },
      data: {
        status: "IN_PROGRESS",
        startedAt: new Date(),
      },
      include: {
        players: { orderBy: { playerIndex: 'asc' } },
        cards: { orderBy: { positionIndex: 'asc' } },
      },
    });

    return this.mapGameToState(updatedGame, updatedGame.players, updatedGame.cards);
  }

  /**
   * Player picks a card
   */
  static async pickCard(
    gameId: string,
    playerId: string,
    cardIndex: number
  ): Promise<{ success: boolean; result?: any; error?: string }> {
    return await prisma.$transaction(async (tx) => {
      // Get game with current state
      const game = await tx.game.findUnique({
        where: { id: gameId },
        include: {
          players: { orderBy: { playerIndex: 'asc' } },
          cards: { orderBy: { positionIndex: 'asc' } },
        },
      });

      if (!game) {
        return { success: false, error: 'Game not found' };
      }

      if (game.status !== "IN_PROGRESS") {
        return { success: false, error: 'Game is not in progress' };
      }

      // Find current player
      const currentPlayer = game.players.find(p => p.id === playerId);
      if (!currentPlayer) {
        return { success: false, error: 'Player not found' };
      }

      // Calculate current turn (simple round-robin)
      const totalPicks = await tx.pick.count({ where: { gameId } });
      const currentPlayerIndex = totalPicks % game.players.length;
      
      if (currentPlayer.playerIndex !== currentPlayerIndex) {
        return { success: false, error: 'Not your turn' };
      }

      // Check if card is already revealed
      const card = game.cards.find(c => c.positionIndex === cardIndex);
      if (!card) {
        return { success: false, error: 'Card not found' };
      }

      if (card.revealedAt) {
        return { success: false, error: 'Card already revealed' };
      }

      // Reveal the card
      const updatedCard = await tx.card.update({
        where: { id: card.id },
        data: {
          revealedByPlayerId: playerId,
          revealedAt: new Date(),
        },
      });

      // Record the pick
      await tx.pick.create({
        data: {
          gameId,
          playerId,
          cardIndex,
          wasPrize: card.isPrize,
        },
      });

      // Check if game should end
      if (card.isPrize) {
        // Mark player as winner
        await tx.player.update({
          where: { id: playerId },
          data: { isWinner: true },
        });

        // End the game
        await tx.game.update({
          where: { id: gameId },
          data: {
            status: "ENDED",
            endedAt: new Date(),
          },
        });

        return {
          success: true,
          result: {
            cardIndex,
            wasPrize: true,
            gameEnded: true,
            winner: {
              id: playerId,
              username: currentPlayer.username,
              playerIndex: currentPlayer.playerIndex,
            },
          },
        };
      } else {
        // Shuffle cards after each non-winning pick
        if (!game.prizePositions) {
          throw new Error('Game has no prize positions');
        }
        const prizePositions = JSON.parse(Buffer.from(game.prizePositions, 'base64').toString());
        
        // Shuffle the positions array
        const shuffledPositions = [...prizePositions];
        console.log('🔄 Shuffling cards - Original prize positions:', prizePositions);
        for (let i = shuffledPositions.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffledPositions[i], shuffledPositions[j]] = [shuffledPositions[j], shuffledPositions[i]];
        }
        console.log('🔄 Shuffled prize positions:', shuffledPositions);

        // Update prize positions in database
        const newEncryptedPositions = this.encryptPrizePositions(shuffledPositions);
        await tx.game.update({
          where: { id: gameId },
          data: { prizePositions: newEncryptedPositions },
        });

        // Update all cards with new prize positions
        for (let i = 0; i < game.cards.length; i++) {
          const isPrize = shuffledPositions.includes(i);
          await tx.card.update({
            where: { id: game.cards[i].id },
            data: { isPrize },
          });
        }

        // Continue to next player
        const nextPlayerIndex = (currentPlayerIndex + 1) % game.players.length;
        return {
          success: true,
          result: {
            cardIndex,
            wasPrize: false,
            gameEnded: false,
            nextPlayerIndex,
            cardsShuffled: true,
          },
        };
      }
    });
  }

  /**
   * Shuffle cards for a game
   */
  static async shuffleCards(gameId: string): Promise<GameState> {
    return await prisma.$transaction(async (tx) => {
      // Get current game state
      const game = await tx.game.findUnique({
        where: { id: gameId },
        include: {
          players: { orderBy: { playerIndex: 'asc' } },
          cards: { orderBy: { positionIndex: 'asc' } },
        },
      });

      if (!game) {
        throw new Error('Game not found');
      }

      if (game.status === "ENDED") {
        throw new Error('Cannot shuffle cards in ended game');
      }

      // Get current prize positions
      if (!game.prizePositions) {
        throw new Error('Game has no prize positions');
      }
      const prizePositions = JSON.parse(Buffer.from(game.prizePositions, 'base64').toString());
      
      // Shuffle the positions array
      const shuffledPositions = [...prizePositions];
      for (let i = shuffledPositions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledPositions[i], shuffledPositions[j]] = [shuffledPositions[j], shuffledPositions[i]];
      }

      // Update prize positions in database
      const newEncryptedPositions = this.encryptPrizePositions(shuffledPositions);
      await tx.game.update({
        where: { id: gameId },
        data: { prizePositions: newEncryptedPositions },
      });

      // Update all cards with new prize positions
      for (let i = 0; i < game.cards.length; i++) {
        const isPrize = shuffledPositions.includes(i);
        await tx.card.update({
          where: { id: game.cards[i].id },
          data: { isPrize },
        });
      }

      // Get updated game state
      const updatedGame = await tx.game.findUnique({
        where: { id: gameId },
        include: {
          players: { orderBy: { playerIndex: 'asc' } },
          cards: { orderBy: { positionIndex: 'asc' } },
        },
      });

      return this.mapGameToState(updatedGame!, updatedGame!.players, updatedGame!.cards);
    });
  }

  /**
   * Player login with code
   */
  static async playerLogin(code: string): Promise<{ token: string; player: PlayerState; game: GameState; shuffled?: boolean } | null> {
    // Find player by code
    const players = await prisma.player.findMany({
      include: { game: { include: { players: true, cards: true } } },
    });

    let player = null;
    for (const p of players) {
      if (await bcrypt.compare(code, p.code)) {
        player = p;
        break;
      }
    }

    if (!player) {
      return null;
    }

    if (player.codeUsed) {
      throw new Error('Code already used');
    }

    // Mark code as used
    await prisma.player.update({
      where: { id: player.id },
      data: { codeUsed: true, connected: true },
    });

    // Generate JWT token
    const jwtSecret: Secret = (process.env.JWT_SECRET || 'changeme') as Secret;
    const expiresInEnv = process.env.JWT_EXPIRES_IN;
    const expiresInVal = expiresInEnv && expiresInEnv.trim() !== ''
      ? (/^\d+$/.test(expiresInEnv) ? Number(expiresInEnv) : expiresInEnv)
      : '30m';
    const token = jwt.sign(
      { playerId: player.id, gameId: player.gameId },
      jwtSecret,
      { expiresIn: expiresInVal } as unknown as SignOptions
    );

    // Get fresh game state after potential shuffle
    const freshGame = await prisma.game.findUnique({
      where: { id: player.gameId },
      include: {
        players: { orderBy: { playerIndex: 'asc' } },
        cards: { orderBy: { positionIndex: 'asc' } },
      },
    });

    const gameState = this.mapGameToState(freshGame!, freshGame!.players, freshGame!.cards);
    const playerState: PlayerState = {
      id: player.id,
      username: player.username,
      playerIndex: player.playerIndex,
      connected: true,
      isWinner: player.isWinner,
    };

    return { token, player: playerState, game: gameState };
  }

  /**
   * Generate random prize positions
   */
  private static generatePrizePositions(totalCards: number, prizeCount: number, seed?: string | number): number[] {
    const positions = Array.from({ length: totalCards }, (_, i) => i);
    if (seed === undefined) {
      const shuffled = positions.sort(() => Math.random() - 0.5);
      return shuffled.slice(0, prizeCount);
    }
    // Deterministic Fisher-Yates with seeded RNG
    const rng = this.createSeededRng(seed);
    for (let i = positions.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [positions[i], positions[j]] = [positions[j], positions[i]];
    }
    return positions.slice(0, prizeCount);
  }

  private static createSeededRng(seed: string | number): () => number {
    let s = typeof seed === 'number' ? seed : Array.from(String(seed)).reduce((acc, ch) => acc * 31 + ch.charCodeAt(0), 0);
    s = (s >>> 0) || 123456789;
    return () => {
      // xorshift32
      s ^= s << 13;
      s ^= s >>> 17;
      s ^= s << 5;
      return ((s >>> 0) % 0x100000000) / 0x100000000;
    };
  }

  /**
   * Encrypt prize positions (simple base64 for demo)
   */
  private static encryptPrizePositions(positions: number[]): string {
    return Buffer.from(JSON.stringify(positions)).toString('base64');
  }

  /**
   * Map database models to game state
   */
  private static mapGameToState(game: any, players: any[], cards: any[]): GameState {
    const totalPicks = 0; // This would be calculated from picks table
    const currentPlayerIndex = totalPicks % players.length;

    return {
      id: game.id,
      name: game.name,
      totalCards: game.totalCards,
      prizeCount: game.prizeCount,
      prizeNames: game.prizeNames ? JSON.parse(game.prizeNames) : [],
      playerSlots: game.playerSlots,
      status: game.status,
      currentPlayerIndex,
      players: players.map(p => ({
        id: p.id,
        username: p.username,
        playerIndex: p.playerIndex,
        connected: p.connected,
        isWinner: p.isWinner,
      })),
      cards: cards.map(c => ({
        id: c.id,
        positionIndex: c.positionIndex,
        isRevealed: !!c.revealedAt,
        isPrize: c.isPrize,
        revealedByPlayerId: c.revealedByPlayerId,
        revealedAt: c.revealedAt?.toISOString(),
      })),
      winner: players.find(p => p.isWinner) ? {
        id: players.find(p => p.isWinner)!.id,
        username: players.find(p => p.isWinner)!.username,
        playerIndex: players.find(p => p.isWinner)!.playerIndex,
        connected: players.find(p => p.isWinner)!.connected,
        isWinner: true,
      } : undefined,
      createdAt: game.createdAt.toISOString(),
      startedAt: game.startedAt?.toISOString(),
      endedAt: game.endedAt?.toISOString(),
    };
  }
}
