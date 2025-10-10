'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Plus, Play, Square, Download, Users, Gamepad2, Trash2 } from 'lucide-react'
import { gameService, Game, PlayerCode } from '@/lib/gameService'
import { GameState } from '@/lib/api'
import { CreateGameForm } from './CreateGameForm'
import { GameList } from './GameList'
import { GameBoard } from './GameBoard'
import { PlayerCodes } from './PlayerCodes'
import toast from 'react-hot-toast'

interface AdminDashboardProps {
  onBack: () => void
}

export function AdminDashboardFirebase({ onBack }: AdminDashboardProps) {
  const [games, setGames] = useState<GameState[]>([])
  const [selectedGame, setSelectedGame] = useState<GameState | null>(null)
  const [playerCodes, setPlayerCodes] = useState<PlayerCode[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [loading, setLoading] = useState(false)

  // Convert Game to GameState
  const convertGameToGameState = (game: Game): GameState => ({
    id: game.id,
    name: game.name,
    totalCards: game.totalCards,
    prizeCount: game.prizeCount,
    prizeNames: game.prizeNames,
    playerSlots: game.playerSlots,
    status: game.status,
    currentPlayerIndex: game.currentPlayerIndex,
    players: game.players.map(p => ({
      id: p.id,
      username: p.username,
      playerIndex: p.playerIndex,
      connected: p.connected,
      isWinner: p.isWinner
    })),
    cards: game.cards.map(c => ({
      id: c.id,
      positionIndex: c.positionIndex,
      isRevealed: c.isRevealed,
      isPrize: c.isPrize,
      prizeNames: c.prizeNames
    })),
    createdAt: game.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    startedAt: undefined,
    endedAt: undefined
  })

  // Load existing games from Firebase on mount
  useEffect(() => {
    const loadGames = async () => {
      try {
        setLoading(true)
        // Load from Firebase
        const firebaseGames = await gameService.getGames()
        console.log('Loaded games from Firebase:', firebaseGames)
        
        // Convert to game states
        const gameStates = firebaseGames.map(game => convertGameToGameState(game as any))
        setGames(gameStates)
        
        if (gameStates.length > 0) {
          setSelectedGame(gameStates[0])
        }
        
        // Also load from localStorage as backup
        const savedGames = JSON.parse(localStorage.getItem('games') || '[]')
        console.log('Loaded games from localStorage:', savedGames)
        
      } catch (error: any) {
        console.error('Error loading games from Firebase:', error)
        // Fallback to localStorage if Firebase fails
        const savedGames = JSON.parse(localStorage.getItem('games') || '[]')
        console.log('Fallback: Loaded games from localStorage:', savedGames)
        setGames(savedGames)
        
        const savedPlayerCodes = JSON.parse(localStorage.getItem('playerCodes') || '[]')
        setPlayerCodes(savedPlayerCodes)
        
        if (savedGames.length > 0) {
          setSelectedGame(savedGames[0])
        }
      } finally {
        setLoading(false)
      }
    }
    loadGames()
  }, [])

  const handleCreateGame = async (data: any) => {
    try {
      setLoading(true)
      console.log('Creating game with data:', data)
      
      // Create game using Firebase service
      const result = await gameService.createGame({
        name: data.name,
        status: 'DRAFT' as const,
        totalCards: data.totalCards,
        prizeCount: data.prizeCount,
        prizeNames: Array.from({ length: data.prizeCount }, (_, i) => `Prize ${i + 1}`),
        playerSlots: data.playerSlots,
        adminId: 'admin'
      })
      
      console.log('Game created in Firebase:', result.game)
      console.log('Player codes created in Firebase:', result.playerCodes)
      
      // Convert to game state and add to local state
      const gameState = convertGameToGameState(result.game as any)
      setGames(prev => [gameState, ...prev])
      setPlayerCodes(result.playerCodes)
      setSelectedGame(gameState)
      
      console.log('Game state created:', gameState)
      console.log('Player codes set in state:', result.playerCodes)
      
      // Also save to localStorage for backup
      const savedGames = JSON.parse(localStorage.getItem('games') || '[]')
      savedGames.unshift(gameState)
      localStorage.setItem('games', JSON.stringify(savedGames))
      localStorage.setItem('playerCodes', JSON.stringify(result.playerCodes))
      
      console.log('Game created and saved to Firebase + localStorage')
      toast.success('Game created successfully!')
      setShowCreateForm(false)
      
    } catch (error: any) {
      console.error('Error creating game:', error)
      toast.error(error.message || 'Failed to create game')
    } finally {
      setLoading(false)
    }
  }

  const handleStartGame = async (gameId: string) => {
    try {
      setLoading(true)
      console.log('🎮 Starting game:', gameId)
      
      // Start game using Firebase service
      const updatedGame = await gameService.startGame(gameId)
      console.log('✅ Game started in Firebase:', updatedGame)
      
      if (!updatedGame) {
        throw new Error('Failed to start game')
      }
      
      // Convert to game state and update local state
      const gameState = convertGameToGameState(updatedGame as any)
      setGames(prev => prev.map(g => g.id === gameId ? gameState : g))
      if (selectedGame?.id === gameId) {
        setSelectedGame(gameState)
      }
      
      // Also save to localStorage as backup
      const savedGames = JSON.parse(localStorage.getItem('games') || '[]')
      const updatedGames = savedGames.map((g: any) => g.id === gameId ? gameState : g)
      localStorage.setItem('games', JSON.stringify(updatedGames))
      
      console.log('🎮 Game started successfully!')
      toast.success('Game started!')
    } catch (error: any) {
      console.error('❌ Error starting game:', error)
      toast.error(error.message || 'Failed to start game')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelGame = async (gameId: string) => {
    try {
      setLoading(true)
      console.log('❌ Cancelling game:', gameId)
      
      // Cancel game using Firebase service
      const success = await gameService.cancelGame(gameId)
      console.log('✅ Game cancelled in Firebase:', success)
      
      if (!success) {
        throw new Error('Failed to cancel game')
      }
      
      // Update local state
      const game = games.find(g => g.id === gameId)
      if (!game) {
        throw new Error('Game not found')
      }
      const updatedGame = { ...game, status: 'CANCELED' as const }
      setGames(prev => prev.map(g => g.id === gameId ? updatedGame : g))
      if (selectedGame?.id === gameId) {
        setSelectedGame(updatedGame)
      }
      
      // Also save to localStorage as backup
      const savedGames = JSON.parse(localStorage.getItem('games') || '[]')
      const updatedGames = savedGames.map((g: any) => g.id === gameId ? updatedGame : g)
      localStorage.setItem('games', JSON.stringify(updatedGames))
      
      console.log('❌ Game cancelled successfully!')
      toast.success('Game cancelled!')
    } catch (error: any) {
      console.error('❌ Error cancelling game:', error)
      toast.error(error.message || 'Failed to cancel game')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteGame = async (gameId: string) => {
    if (!confirm('Are you sure you want to delete this game? This action cannot be undone.')) {
      return
    }

    try {
      setLoading(true)
      console.log('🗑️ Deleting game:', gameId)
      
      // Delete game using Firebase service
      const success = await gameService.deleteGame(gameId)
      console.log('✅ Game deleted in Firebase:', success)
      
      if (!success) {
        throw new Error('Failed to delete game')
      }
      
      // Update local state
      setGames(prev => prev.filter(g => g.id !== gameId))
      if (selectedGame?.id === gameId) {
        setSelectedGame(games.length > 1 ? games.find(g => g.id !== gameId) || null : null)
      }
      
      // Also save to localStorage as backup
      const savedGames = JSON.parse(localStorage.getItem('games') || '[]')
      const updatedGames = savedGames.filter((g: any) => g.id !== gameId)
      localStorage.setItem('games', JSON.stringify(updatedGames))
      
      console.log('🗑️ Game deleted successfully!')
      toast.success('Game deleted!')
    } catch (error: any) {
      console.error('❌ Error deleting game:', error)
      toast.error(error.message || 'Failed to delete game')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectGame = (game: GameState) => {
    setSelectedGame(game)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-zinc-400 hover:text-zinc-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Menu</span>
            </button>
            <div className="h-6 w-px bg-zinc-700" />
            <h1 className="text-2xl font-bold text-zinc-100">Admin Dashboard</h1>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Game</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Game List */}
          <div className="lg:col-span-1">
            <GameList
              games={games}
              selectedGame={selectedGame}
              onSelectGame={handleSelectGame}
              onStartGame={handleStartGame}
              onCancelGame={handleCancelGame}
              onDeleteGame={handleDeleteGame}
              loading={loading}
            />
          </div>

          {/* Game Board */}
          <div className="lg:col-span-2">
            {selectedGame ? (
              <div className="space-y-6">
                <GameBoard game={selectedGame} />
                
                {/* Player Codes */}
                {(() => {
                  const gamePlayerCodes = playerCodes.filter(pc => pc.gameId === selectedGame.id)
                  console.log('Filtered player codes for selected game:', gamePlayerCodes)
                  return gamePlayerCodes.length > 0 && (
                    <PlayerCodes codes={gamePlayerCodes} />
                  )
                })()}
              </div>
            ) : (
              <div className="flex items-center justify-center h-96 bg-zinc-900/60 rounded-2xl border border-zinc-800">
                <div className="text-center">
                  <Gamepad2 className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-zinc-400 mb-2">No Game Selected</h3>
                  <p className="text-sm text-zinc-500">Select a game from the list to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Create Game Form Modal */}
        {showCreateForm && (
          <CreateGameForm
            onSubmit={handleCreateGame}
            onClose={() => setShowCreateForm(false)}
            loading={loading}
          />
        )}
      </div>
    </div>
  )
}
