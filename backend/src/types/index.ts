export interface GameState {
  id: string;
  name: string;
  totalCards: number;
  prizeCount: number;
  prizeNames: string[];
  playerSlots: number;
  status: 'DRAFT' | 'WAITING' | 'IN_PROGRESS' | 'ENDED' | 'CANCELED';
  currentPlayerIndex: number;
  players: PlayerState[];
  cards: CardState[];
  winner?: PlayerState;
  createdAt: string;
  startedAt?: string;
  endedAt?: string;
}

export interface PlayerState {
  id: string;
  username: string;
  playerIndex: number;
  connected: boolean;
  isWinner: boolean;
}

export interface CardState {
  id: string;
  positionIndex: number;
  isRevealed: boolean;
  isPrize: boolean;
  revealedByPlayerId?: string;
  revealedAt?: string;
}

export interface PickResult {
  cardIndex: number;
  wasPrize: boolean;
  gameEnded: boolean;
  winner?: PlayerState;
  nextPlayerIndex?: number;
  cardsShuffled?: boolean;
}

export interface LoginResponse {
  token: string;
  player: PlayerState;
  game: GameState;
}

export interface CreateGameRequest {
  name: string;
  totalCards: number;
  prizeCount: number;
  prizeNames?: string[];
  playerSlots: number;
  rows?: number;
  cols?: number;
  startTime?: string;
  seed?: string | number;
}

export interface CreateGameResponse {
  game: GameState;
  playerCodes: Array<{
    username: string;
    code: string;
  }>;
}

// Socket.IO event types
export interface ServerToClientEvents {
  'game:state': (gameState: GameState) => void;
  'card:revealed': (data: { cardIndex: number; playerId: string; wasPrize: boolean; message: string; prizeNames: string[] }) => void;
  'turn:changed': (data: { currentPlayerIndex: number }) => void;
  'game:ended': (data: { winnerPlayerId: string; cardIndex: number }) => void;
  'player:connected': (data: { playerId: string; username: string }) => void;
  'player:disconnected': (data: { playerId: string; username: string }) => void;
  'cards:shuffled': (data: { message: string; shuffledBy: string }) => void;
  'error': (error: string) => void;
}

export interface ClientToServerEvents {
  'pick:card': (data: { cardIndex: number }, callback: (result: PickResult | { error: string }) => void) => void;
  'request:sync': (callback: (result: GameState | { error: string }) => void) => void;
  'join:game': (data: { gameId: string }) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  playerId?: string;
  gameId?: string;
  username?: string;
}

