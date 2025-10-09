import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  onSnapshot,
  query,
  orderBy,
  where,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';

export interface Game {
  id: string;
  name: string;
  status: 'DRAFT' | 'WAITING' | 'IN_PROGRESS' | 'ENDED' | 'CANCELED';
  totalCards: number;
  prizeCount: number;
  prizeNames: string[];
  playerSlots: number;
  createdAt: any;
  cards: Card[];
  players: Player[];
  currentPlayerIndex: number;
  picks: Pick[];
  adminId: string;
}

export interface Card {
  id: string;
  positionIndex: number;
  isRevealed: boolean;
  isPrize: boolean;
  prizeNames: string[];
}

export interface Player {
  id: string;
  username: string;
  playerIndex: number;
  connected: boolean;
  isWinner: boolean;
  joinedAt: any;
}

export interface Pick {
  id: string;
  playerId: string;
  cardIndex: number;
  wasPrize: boolean;
  timestamp: any;
  prizeNames: string[];
}

export interface PlayerCode {
  username: string;
  code: string;
  gameId: string;
}

// Game Management Functions
export const gameService = {
  // Create a new game
  async createGame(gameData: Omit<Game, 'id' | 'createdAt' | 'cards' | 'players' | 'currentPlayerIndex' | 'picks'>): Promise<{ game: Game; playerCodes: PlayerCode[] }> {
    const gameRef = await addDoc(collection(db, 'games'), {
      ...gameData,
      status: 'DRAFT',
      cards: [],
      players: [],
      currentPlayerIndex: 0,
      picks: [],
      createdAt: serverTimestamp()
    });

    // Generate player codes
    const playerCodes: PlayerCode[] = [];
    for (let i = 0; i < gameData.playerSlots; i++) {
      const code = Math.random().toString(36).substr(2, 6).toUpperCase();
      playerCodes.push({
        username: `Player ${i + 1}`,
        code,
        gameId: gameRef.id
      });
      
      // Store player code in Firestore
      await addDoc(collection(db, 'playerCodes'), {
        username: `Player ${i + 1}`,
        code,
        gameId: gameRef.id,
        createdAt: serverTimestamp()
      });
    }

    const game: Game = {
      id: gameRef.id,
      ...gameData,
      status: 'DRAFT',
      cards: [],
      players: [],
      currentPlayerIndex: 0,
      picks: [],
      createdAt: new Date()
    };

    return { game, playerCodes };
  },

  // Get all games
  async getGames(): Promise<Game[]> {
    const gamesRef = collection(db, 'games');
    const q = query(gamesRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Game));
  },

  // Get a specific game
  async getGame(gameId: string): Promise<Game | null> {
    const gameRef = doc(db, 'games', gameId);
    const gameSnap = await getDoc(gameRef);
    
    if (gameSnap.exists()) {
      return {
        id: gameSnap.id,
        ...gameSnap.data()
      } as Game;
    }
    
    return null;
  },

  // Start a game
  async startGame(gameId: string): Promise<Game | null> {
    const game = await this.getGame(gameId);
    if (!game) return null;

    // Create cards for the game
    const cards: Card[] = [];
    const prizeIndices = new Set<number>();
    
    // Randomly select prize positions
    while (prizeIndices.size < game.prizeCount) {
      prizeIndices.add(Math.floor(Math.random() * game.totalCards));
    }

    for (let i = 0; i < game.totalCards; i++) {
      cards.push({
        id: `card-${i}`,
        positionIndex: i,
        isRevealed: false,
        isPrize: prizeIndices.has(i),
        prizeNames: prizeIndices.has(i) ? [`Prize ${prizeIndices.size - Array.from(prizeIndices).indexOf(i)}`] : []
      });
    }

    // Update the game
    const gameRef = doc(db, 'games', gameId);
    await updateDoc(gameRef, {
      status: 'IN_PROGRESS',
      cards: cards
    });

    return {
      ...game,
      status: 'IN_PROGRESS',
      cards: cards
    };
  },

  // Cancel a game
  async cancelGame(gameId: string): Promise<boolean> {
    const gameRef = doc(db, 'games', gameId);
    await updateDoc(gameRef, {
      status: 'CANCELLED'
    });
    return true;
  },

  // Delete a game
  async deleteGame(gameId: string): Promise<boolean> {
    const gameRef = doc(db, 'games', gameId);
    await deleteDoc(gameRef);
    
    // Also delete associated player codes
    const codesQuery = query(collection(db, 'playerCodes'), where('gameId', '==', gameId));
    const codesSnapshot = await getDocs(codesQuery);
    codesSnapshot.forEach(async (codeDoc) => {
      await deleteDoc(codeDoc.ref);
    });
    
    return true;
  },

  // Join a game with player code
  async joinGame(code: string): Promise<{ player: Player; game: Game } | null> {
    // Find the player code
    const codesQuery = query(collection(db, 'playerCodes'), where('code', '==', code));
    const codesSnapshot = await getDocs(codesQuery);
    
    if (codesSnapshot.empty) {
      throw new Error('Invalid game code');
    }

    const codeData = codesSnapshot.docs[0].data();
    const game = await this.getGame(codeData.gameId);
    
    if (!game) {
      throw new Error('Game not found');
    }

    // Check if player already exists
    const existingPlayer = game.players.find(p => p.username === codeData.username);
    if (existingPlayer) {
      return { player: existingPlayer, game };
    }

    // Create new player
    const player: Player = {
      id: Math.random().toString(36).substr(2, 9),
      username: codeData.username,
      playerIndex: game.players.length,
      connected: true,
      isWinner: false,
      joinedAt: new Date()
    };

    // Add player to game
    const gameRef = doc(db, 'games', codeData.gameId);
    await updateDoc(gameRef, {
      players: [...game.players, player]
    });

    return { player, game: { ...game, players: [...game.players, player] } };
  },

  // Pick a card
  async pickCard(gameId: string, playerId: string, cardIndex: number): Promise<{ success: boolean; wasPrize: boolean; prizeNames: string[] }> {
    const game = await this.getGame(gameId);
    if (!game || game.status !== 'IN_PROGRESS') {
      throw new Error('Game not in progress');
    }

    const card = game.cards[cardIndex];
    if (!card || card.isRevealed) {
      throw new Error('Invalid card or already revealed');
    }

    // Update card
    const updatedCards = [...game.cards];
    updatedCards[cardIndex] = { ...card, isRevealed: true };

    // Create pick record
    const pick: Pick = {
      id: Math.random().toString(36).substr(2, 9),
      playerId,
      cardIndex,
      wasPrize: card.isPrize,
      timestamp: new Date(),
      prizeNames: card.prizeNames
    };

    // Update game
    const gameRef = doc(db, 'games', gameId);
    await updateDoc(gameRef, {
      cards: updatedCards,
      picks: [...game.picks, pick],
      currentPlayerIndex: (game.currentPlayerIndex + 1) % game.players.length
    });

    return {
      success: true,
      wasPrize: card.isPrize,
      prizeNames: card.prizeNames
    };
  },

  // Subscribe to game updates
  subscribeToGame(gameId: string, callback: (game: Game) => void): () => void {
    // Temporarily disabled real-time listeners due to connection issues
    // Return a no-op function
    return () => {};
  }
};
