import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('player')
      localStorage.removeItem('game')
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

export interface CreateGameRequest {
  name: string
  totalCards: number
  prizeCount: number
  prizeNames?: string[]
  playerSlots: number
  rows?: number
  cols?: number
  startTime?: string
  seed?: string | number
}

export interface CreateGameResponse {
  game: GameState
  playerCodes: Array<{
    username: string
    code: string
  }>
}

export interface GameState {
  id: string
  name: string
  totalCards: number
  prizeCount: number
  prizeNames: string[]
  playerSlots: number
  status: 'DRAFT' | 'WAITING' | 'IN_PROGRESS' | 'ENDED' | 'CANCELED'
  currentPlayerIndex: number
  players: PlayerState[]
  cards: CardState[]
  winner?: PlayerState
  createdAt: string
  startedAt?: string
  endedAt?: string
}

export interface PlayerState {
  id: string
  username: string
  playerIndex: number
  connected: boolean
  isWinner: boolean
}

export interface CardState {
  id: string
  positionIndex: number
  isRevealed: boolean
  isPrize: boolean
  revealedByPlayerId?: string
  revealedAt?: string
}

export interface LoginResponse {
  token: string
  player: PlayerState
  game: GameState
}

export interface PickResult {
  cardIndex: number
  wasPrize: boolean
  gameEnded: boolean
  winner?: PlayerState
  nextPlayerIndex?: number
  cardsShuffled?: boolean
}

// Socket.IO event types (mirrors backend)
export interface ServerToClientEvents {
  'game:state': (gameState: GameState) => void
  'card:revealed': (data: { cardIndex: number; playerId: string; wasPrize: boolean; message: string; prizeNames: string[] }) => void
  'turn:changed': (data: { currentPlayerIndex: number }) => void
  'game:ended': (data: { winnerPlayerId: string; cardIndex: number }) => void
  'player:connected': (data: { playerId: string; username: string }) => void
  'player:disconnected': (data: { playerId: string; username: string }) => void
  'cards:shuffled': (data: { message: string; shuffledBy: string }) => void
  'error': (error: string) => void
}

export interface ClientToServerEvents {
  'pick:card': (data: { cardIndex: number }, callback: (result: PickResult | { error: string }) => void) => void
  'request:sync': (callback: (result: GameState | { error: string }) => void) => void
  'join:game': (data: { gameId: string }) => void
}

// Auth API
export const authAPI = {
  playerLogin: async (code: string): Promise<LoginResponse> => {
    const response = await api.post('/api/auth/player/login', { code })
    return response.data
  },
}

// Admin API
export const adminAPI = {
  listGames: async (): Promise<{ games: Array<Pick<GameState, 'id' | 'name' | 'totalCards' | 'prizeCount' | 'playerSlots' | 'status' | 'createdAt'>> }> => {
    const response = await api.get('/api/admin/games', {
      headers: {
        'X-Admin-Key': process.env.NEXT_PUBLIC_ADMIN_KEY || 'admin123',
      },
    })
    return response.data
  },
  createGame: async (data: CreateGameRequest): Promise<CreateGameResponse> => {
    const response = await api.post('/api/admin/games', data, {
      headers: {
        'X-Admin-Key': process.env.NEXT_PUBLIC_ADMIN_KEY || 'admin123',
      },
    })
    return response.data
  },

  getGame: async (gameId: string): Promise<{ game: GameState }> => {
    const response = await api.get(`/api/admin/games/${gameId}`, {
      headers: {
        'X-Admin-Key': process.env.NEXT_PUBLIC_ADMIN_KEY || 'admin123',
      },
    })
    return response.data
  },

  startGame: async (gameId: string): Promise<{ game: GameState }> => {
    const response = await api.post(`/api/admin/games/${gameId}/start`, {}, {
      headers: {
        'X-Admin-Key': process.env.NEXT_PUBLIC_ADMIN_KEY || 'admin123',
      },
    })
    return response.data
  },

  cancelGame: async (gameId: string): Promise<{ message: string }> => {
    const response = await api.post(`/api/admin/games/${gameId}/cancel`, {}, {
      headers: {
        'X-Admin-Key': process.env.NEXT_PUBLIC_ADMIN_KEY || 'admin123',
      },
    })
    return response.data
  },

  deleteGame: async (gameId: string): Promise<{ message: string }> => {
    const response = await api.delete(`/api/admin/games/${gameId}`, {
      headers: {
        'X-Admin-Key': process.env.NEXT_PUBLIC_ADMIN_KEY || 'admin123',
      },
    })
    return response.data
  },
}

// Game API
export const gameAPI = {
  getGameState: async (gameId: string): Promise<{ game: GameState }> => {
    const response = await api.get(`/api/games/${gameId}/state`)
    return response.data
  },

  pickCard: async (gameId: string, cardIndex: number): Promise<PickResult> => {
    const response = await api.post(`/api/games/${gameId}/pick`, { cardIndex })
    return response.data
  },
}

export { api }



