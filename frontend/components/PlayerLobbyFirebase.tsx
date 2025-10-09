'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Gamepad2, Users, Eye } from 'lucide-react'
import { gameService, Game, Player } from '@/lib/gameService'
import { GameState } from '@/lib/api'
import { GameInterface } from './GameInterface'
import toast from 'react-hot-toast'

interface PlayerLobbyProps {
  onBack: () => void
}

export function PlayerLobbyFirebase({ onBack }: PlayerLobbyProps) {
  const [gameCode, setGameCode] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [player, setPlayer] = useState<Player | null>(null)
  const [game, setGame] = useState<Game | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Check if already logged in (from localStorage)
    const savedPlayer = localStorage.getItem('player')
    const savedGame = localStorage.getItem('game')
    const savedToken = localStorage.getItem('token')

    if (savedPlayer && savedGame && savedToken) {
      try {
        setPlayer(JSON.parse(savedPlayer))
        setGame(JSON.parse(savedGame))
        setIsLoggedIn(true)
        
        // Subscribe to game updates
        const gameId = JSON.parse(savedGame).id
        if (gameId) {
          const unsubscribe = gameService.subscribeToGame(gameId, (updatedGame) => {
            setGame(updatedGame)
            localStorage.setItem('game', JSON.stringify(updatedGame))
          })
          
          return () => unsubscribe()
        }
      } catch (error) {
        // Clear invalid data
        localStorage.removeItem('player')
        localStorage.removeItem('game')
        localStorage.removeItem('token')
      }
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!gameCode.trim()) return

    try {
      setLoading(true)
      const result = await gameService.joinGame(gameCode.trim())
      if (!result) {
        throw new Error('Login failed')
      }
      
      // Store auth data
      const token = Math.random().toString(36).substr(2, 20) // Simple token for demo
      localStorage.setItem('token', token)
      localStorage.setItem('player', JSON.stringify(result.player))
      localStorage.setItem('game', JSON.stringify(result.game))
      
      setPlayer(result.player)
      setGame(result.game)
      setIsLoggedIn(true)
      
      toast.success(`Welcome ${result.player.username}!`)
      
      // Subscribe to game updates
      const unsubscribe = gameService.subscribeToGame(result.game.id!, (updatedGame) => {
        setGame(updatedGame)
        localStorage.setItem('game', JSON.stringify(updatedGame))
      })
      
      // Store unsubscribe function for cleanup
      ;(window as any).gameUnsubscribe = unsubscribe
      
    } catch (error: any) {
      console.error('Login error:', error)
      toast.error(error.message || 'Invalid game code')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    // Unsubscribe from game updates
    if ((window as any).gameUnsubscribe) {
      ;(window as any).gameUnsubscribe()
    }
    
    // Clear auth data
    localStorage.removeItem('token')
    localStorage.removeItem('player')
    localStorage.removeItem('game')
    
    setPlayer(null)
    setGame(null)
    setIsLoggedIn(false)
    setGameCode('')
    
    toast.success('Logged out successfully')
  }

  const handleGameUpdate = (updatedGame: GameState) => {
    setGame(updatedGame)
    localStorage.setItem('game', JSON.stringify(updatedGame))
  }

  if (isLoggedIn && player && game) {
    return (
      <GameInterface
        player={player}
        game={game}
        onLogout={handleLogout}
        onGameUpdate={handleGameUpdate}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Menu</span>
          </button>
        </div>

        {/* Login Form */}
        <div className="bg-zinc-900/60 backdrop-blur-sm rounded-2xl border border-zinc-800 p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-500/10 rounded-2xl mb-4">
              <Gamepad2 className="w-8 h-8 text-indigo-400" />
            </div>
            <h1 className="text-2xl font-bold text-zinc-100 mb-2">Join Game</h1>
            <p className="text-zinc-500">Enter your game code to join a Razz game</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="gameCode" className="block text-sm font-medium text-zinc-300 mb-2">
                Game Code
              </label>
              <input
                id="gameCode"
                type="text"
                value={gameCode}
                onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                placeholder="Enter game code..."
                className="w-full px-4 py-3 bg-zinc-800/60 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !gameCode.trim()}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Joining...</span>
                </>
              ) : (
                <>
                  <Users className="w-4 h-4" />
                  <span>Join Game</span>
                </>
              )}
            </button>
          </form>

          {/* Instructions */}
          <div className="mt-8 p-4 bg-zinc-800/40 rounded-lg border border-zinc-700">
            <div className="flex items-start space-x-3">
              <Eye className="w-5 h-5 text-zinc-400 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-zinc-300 mb-1">How to join:</h3>
                <ul className="text-xs text-zinc-500 space-y-1">
                  <li>• Get a game code from the game admin</li>
                  <li>• Enter the code above and click &quot;Join Game&quot;</li>
                  <li>• Wait for the admin to start the game</li>
                  <li>• Pick cards when it&apos;s your turn!</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
