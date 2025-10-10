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
  // Check if Firebase is initialized
  isFirebaseReady(): boolean {
    return typeof window !== 'undefined' && db !== null;
  },

  // Create a new game
  async createGame(gameData: Omit<Game, 'id' | 'createdAt' | 'cards' | 'players' | 'currentPlayerIndex' | 'picks'>): Promise<{ game: Game; playerCodes: PlayerCode[] }> {
    if (!this.isFirebaseReady()) {
      throw new Error('Firebase not initialized. Please refresh the page.');
    }
    console.log('Starting createGame with data:', gameData);
    
    try {
      console.log('Creating game document in Firestore...');
      const gameRef = await addDoc(collection(db, 'games'), {
        ...gameData,
        status: 'DRAFT',
        cards: [],
        players: [],
        currentPlayerIndex: 0,
        picks: [],
        createdAt: serverTimestamp()
      });
      console.log('Game document created with ID:', gameRef.id);

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
        console.log(`Creating player code ${i + 1}...`);
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

      console.log('Game creation completed successfully');
      return { game, playerCodes };
    } catch (error) {
      console.error('Error in createGame:', error);
      throw error;
    }
  },

  // Get all games
  async getGames(): Promise<Game[]> {
    if (!this.isFirebaseReady()) {
      throw new Error('Firebase not initialized. Please refresh the page.');
    }
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
    if (!this.isFirebaseReady()) {
      throw new Error('Firebase not initialized. Please refresh the page.');
    }
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
    if (!this.isFirebaseReady()) {
      throw new Error('Firebase not initialized. Please refresh the page.');
    }
    try {
      console.log('🔍 Searching for game code:', code);
      
      // Find the player code
      const codesQuery = query(collection(db, 'playerCodes'), where('code', '==', code));
      console.log('📝 Executing query for player codes...');
      const codesSnapshot = await getDocs(codesQuery);
      
      console.log('📊 Query results:', {
        empty: codesSnapshot.empty,
        size: codesSnapshot.size,
        docs: codesSnapshot.docs.map(doc => ({ id: doc.id, data: doc.data() }))
      });
      
      if (codesSnapshot.empty) {
        console.error('❌ No player codes found for:', code);
        throw new Error('Invalid game code');
      }

      const codeData = codesSnapshot.docs[0].data();
      console.log('✅ Found player code data:', codeData);
      
      const game = await this.getGame(codeData.gameId);
      console.log('🎮 Retrieved game:', game ? 'Found' : 'Not found');
      
      if (!game) {
        throw new Error('Game not found');
      }

      // Check if player already exists
      const existingPlayer = game.players.find(p => p.username === codeData.username);
      if (existingPlayer) {
        console.log('👤 Player already exists, returning existing player');
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

      console.log('👤 Creating new player:', player);

      // Add player to game
      const gameRef = doc(db, 'games', codeData.gameId);
      await updateDoc(gameRef, {
        players: [...game.players, player]
      });

      console.log('✅ Player added to game successfully');
      return { player, game: { ...game, players: [...game.players, player] } };
    } catch (error) {
      console.error('❌ Error in joinGame:', error);
      throw error;
    }
  },

  // Pick a card
  async pickCard(gameId: string, playerId: string, cardIndex: number): Promise<{ success: boolean; wasPrize: boolean; prizeNames: string[]; gameEnded?: boolean }> {
    if (!this.isFirebaseReady()) {
      throw new Error('Firebase not initialized. Please refresh the page.');
    }
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

    // Determine next player
    let nextPlayerIndex = game.currentPlayerIndex;
    if (!card.isPrize) {
      // Only advance turn if no prize was found
      nextPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length;
    }

    console.log('🔄 Starting shuffle...')
    const beforeCards = updatedCards.slice(0, 5).map(c => `${c.positionIndex}(${c.isRevealed ? 'R' : 'U'})`)
    console.log('Before shuffle - first 5 cards by position:', beforeCards.join(', '))
    
    // Create a completely new shuffled array
    let shuffledCards = new Array(updatedCards.length);
    
    // First, place all revealed cards in their original positions
    for (let i = 0; i < updatedCards.length; i++) {
      if (updatedCards[i].isRevealed) {
        shuffledCards[i] = updatedCards[i];
      }
    }
    
    // Get all unrevealed cards
    const unrevealedCards = updatedCards.filter(c => !c.isRevealed);
    console.log('Unrevealed cards count:', unrevealedCards.length)
    
    // Get all empty positions (where revealed cards are not)
    const emptyPositions = [];
    for (let i = 0; i < updatedCards.length; i++) {
      if (!updatedCards[i].isRevealed) {
        emptyPositions.push(i);
      }
    }
    console.log('Empty positions:', emptyPositions.join(', '))
    
    // Shuffle the empty positions
    const shuffledPositions = [...emptyPositions].sort(() => Math.random() - 0.5);
    console.log('Shuffled positions:', shuffledPositions.join(', '))
    
    // Place unrevealed cards in shuffled positions
    for (let i = 0; i < unrevealedCards.length; i++) {
      const newPosition = shuffledPositions[i];
      shuffledCards[newPosition] = {
        ...unrevealedCards[i],
        positionIndex: newPosition
      };
    }
    
    const afterCardsByPosition = shuffledCards.slice(0, 5).map(c => `${c.positionIndex}(${c.isRevealed ? 'R' : 'U'})`)
    const afterCardsByIndex = shuffledCards.slice(0, 5).map((c, i) => `[${i}]=${c.positionIndex}(${c.isRevealed ? 'R' : 'U'})`)
    const afterUnrevealedCards = shuffledCards.filter(c => !c.isRevealed).slice(0, 5).map(c => `${c.positionIndex}(${c.isRevealed ? 'R' : 'U'})`)
    console.log('After shuffle - first 5 cards by position:', afterCardsByPosition.join(', '))
    console.log('After shuffle - first 5 cards by array index:', afterCardsByIndex.join(', '))
    console.log('After shuffle - first 5 UNREVEALED cards:', afterUnrevealedCards.join(', '))

    // Update game
    const gameRef = doc(db, 'games', gameId);
    
    if (card.isPrize) {
      // Game ends when prize is won
      await updateDoc(gameRef, {
        cards: shuffledCards,
        picks: [...game.picks, pick],
        currentPlayerIndex: nextPlayerIndex,
        status: 'ENDED',
        endedAt: new Date()
      });
      
      // Mark player as winner
      const playerRef = doc(db, 'players', playerId);
      await updateDoc(playerRef, {
        isWinner: true
      });
      
      console.log('🎉 Game ended! Prize won by player:', playerId);
    } else {
      // Continue game with shuffling
      await updateDoc(gameRef, {
        cards: shuffledCards,
        picks: [...game.picks, pick],
        currentPlayerIndex: nextPlayerIndex
      });
    }

    return {
      success: true,
      wasPrize: card.isPrize,
      prizeNames: card.prizeNames,
      gameEnded: card.isPrize
    };
  },

  // Subscribe to game updates
  subscribeToGame(gameId: string, callback: (game: Game) => void): () => void {
    // Temporarily disabled real-time listeners due to connection issues
    // Return a no-op function
    return () => {};
  }
};
