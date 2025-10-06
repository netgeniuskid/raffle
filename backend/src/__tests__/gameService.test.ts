import { GameService } from '../services/gameService'
import { PrismaClient } from '@prisma/client'

// Mock Prisma
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    game: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    player: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    card: {
      create: jest.fn(),
    },
    pick: {
      create: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn(),
  })),
}))

describe('GameService', () => {
  let mockPrisma: any

  beforeEach(() => {
    mockPrisma = new PrismaClient()
    jest.clearAllMocks()
  })

  describe('createGame', () => {
    it('should create a game with valid data', async () => {
      const gameData = {
        name: 'Test Game',
        totalCards: 20,
        prizeCount: 1,
        playerSlots: 4,
      }

      const mockGame = {
        id: 'game-1',
        name: 'Test Game',
        totalCards: 20,
        prizeCount: 1,
        playerSlots: 4,
        status: 'DRAFT',
        createdAt: new Date(),
      }

      const mockPlayers = Array.from({ length: 4 }, (_, i) => ({
        id: `player-${i}`,
        username: `Player ${i + 1}`,
        playerIndex: i,
        connected: false,
        isWinner: false,
      }))

      const mockCards = Array.from({ length: 20 }, (_, i) => ({
        id: `card-${i}`,
        positionIndex: i,
        isPrize: i === 5, // Prize at position 5
        revealedAt: null,
      }))

      mockPrisma.game.create.mockResolvedValue(mockGame)
      mockPrisma.card.create.mockResolvedValue(mockCards[0])
      mockPrisma.player.create.mockResolvedValue(mockPlayers[0])

      const result = await GameService.createGame(gameData)

      expect(result.game.name).toBe('Test Game')
      expect(result.playerCodes).toHaveLength(4)
      expect(mockPrisma.game.create).toHaveBeenCalled()
      expect(mockPrisma.card.create).toHaveBeenCalledTimes(20)
      expect(mockPrisma.player.create).toHaveBeenCalledTimes(4)
    })

    it('should throw error for invalid prize count', async () => {
      const gameData = {
        name: 'Test Game',
        totalCards: 10,
        prizeCount: 10, // Invalid: same as total cards
        playerSlots: 4,
      }

      await expect(GameService.createGame(gameData)).rejects.toThrow(
        'Prize count must be at least 1 and less than total cards'
      )
    })

    it('should throw error for insufficient players', async () => {
      const gameData = {
        name: 'Test Game',
        totalCards: 20,
        prizeCount: 1,
        playerSlots: 1, // Invalid: less than 2
      }

      await expect(GameService.createGame(gameData)).rejects.toThrow(
        'Must have at least 2 players'
      )
    })
  })

  describe('pickCard', () => {
    it('should successfully pick a non-prize card', async () => {
      const mockGame = {
        id: 'game-1',
        status: 'IN_PROGRESS',
        players: [
          { id: 'player-1', playerIndex: 0 },
          { id: 'player-2', playerIndex: 1 },
        ],
        cards: [
          { id: 'card-1', positionIndex: 0, isPrize: false, revealedAt: null },
          { id: 'card-2', positionIndex: 1, isPrize: true, revealedAt: null },
        ],
      }

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        return callback({
          game: {
            findUnique: jest.fn().mockResolvedValue(mockGame),
          },
          player: {
            findUnique: jest.fn().mockResolvedValue({ id: 'player-1', playerIndex: 0 }),
          },
          card: {
            update: jest.fn().mockResolvedValue({ ...mockGame.cards[0], revealedAt: new Date() }),
          },
          pick: {
            create: jest.fn().mockResolvedValue({}),
            count: jest.fn().mockResolvedValue(0),
          },
        })
      })

      const result = await GameService.pickCard('game-1', 'player-1', 0)

      expect(result.success).toBe(true)
      expect(result.result?.wasPrize).toBe(false)
      expect(result.result?.gameEnded).toBe(false)
    })

    it('should end game when prize card is picked', async () => {
      const mockGame = {
        id: 'game-1',
        status: 'IN_PROGRESS',
        players: [
          { id: 'player-1', playerIndex: 0, username: 'Player 1' },
        ],
        cards: [
          { id: 'card-1', positionIndex: 0, isPrize: true, revealedAt: null },
        ],
      }

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        return callback({
          game: {
            findUnique: jest.fn().mockResolvedValue(mockGame),
            update: jest.fn().mockResolvedValue({}),
          },
          player: {
            findUnique: jest.fn().mockResolvedValue({ id: 'player-1', playerIndex: 0, username: 'Player 1' }),
            update: jest.fn().mockResolvedValue({}),
          },
          card: {
            update: jest.fn().mockResolvedValue({ ...mockGame.cards[0], revealedAt: new Date() }),
          },
          pick: {
            create: jest.fn().mockResolvedValue({}),
            count: jest.fn().mockResolvedValue(0),
          },
        })
      })

      const result = await GameService.pickCard('game-1', 'player-1', 0)

      expect(result.success).toBe(true)
      expect(result.result?.wasPrize).toBe(true)
      expect(result.result?.gameEnded).toBe(true)
    })

    it('should reject pick when not player turn', async () => {
      const mockGame = {
        id: 'game-1',
        status: 'IN_PROGRESS',
        players: [
          { id: 'player-1', playerIndex: 0 },
          { id: 'player-2', playerIndex: 1 },
        ],
        cards: [
          { id: 'card-1', positionIndex: 0, isPrize: false, revealedAt: null },
        ],
      }

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        return callback({
          game: {
            findUnique: jest.fn().mockResolvedValue(mockGame),
          },
          player: {
            findUnique: jest.fn().mockResolvedValue({ id: 'player-2', playerIndex: 1 }),
          },
          pick: {
            count: jest.fn().mockResolvedValue(0), // Current turn is player 0
          },
        })
      })

      const result = await GameService.pickCard('game-1', 'player-2', 0)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Not your turn')
    })
  })
})











