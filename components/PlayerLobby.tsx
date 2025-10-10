'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, LogIn, Users, Gamepad2, Trophy } from 'lucide-react'
import { authAPI, gameAPI, GameState, PlayerState } from '@/lib/api'
import { connectSocket, disconnectSocket, getSocket } from '@/lib/socket'
import { GameInterface } from './GameInterface'
import toast from 'react-hot-toast'

interface PlayerLobbyProps {
  onBack: () => void
}

export function PlayerLobby({ onBack }: PlayerLobbyProps) {
  const [gameCode, setGameCode] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [player, setPlayer] = useState<PlayerState | null>(null)
  const [game, setGame] = useState<GameState | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Check if already logged in
    const token = localStorage.getItem('token')
    const savedPlayer = localStorage.getItem('player')
    const savedGame = localStorage.getItem('game')

    if (token && savedPlayer && savedGame) {
      try {
        setPlayer(JSON.parse(savedPlayer))
        setGame(JSON.parse(savedGame))
        setIsLoggedIn(true)
        connectSocket(token)
      } catch (error) {
        // Clear invalid data
        localStorage.removeItem('token')
        localStorage.removeItem('player')
        localStorage.removeItem('game')
      }
    }

    return () => {
      disconnectSocket()
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!gameCode.trim()) return

    try {
      setLoading(true)
      const response = await authAPI.playerLogin(gameCode.trim())
      
      // Store auth data
      localStorage.setItem('token', response.token)
      localStorage.setItem('player', JSON.stringify(response.player))
      localStorage.setItem('game', JSON.stringify(response.game))
      
      setPlayer(response.player)
      setGame(response.game)
      setIsLoggedIn(true)
      
      // Connect to socket
      connectSocket(response.token)
      
      toast.success(`Welcome ${response.player.username}!`)
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || error.message || 'Invalid game code'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    disconnectSocket()
    localStorage.removeItem('token')
    localStorage.removeItem('player')
    localStorage.removeItem('game')
    setPlayer(null)
    setGame(null)
    setIsLoggedIn(false)
    setGameCode('')
    toast.success('Logged out successfully')
  }

  if (isLoggedIn && player && game) {
    return (
      <GameInterface
        player={player}
        game={game}
        onLogout={handleLogout}
        onGameUpdate={setGame}
      />
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent blur-3xl" />
      <div className="max-w-md w-full mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-8 relative">
          <button
            onClick={onBack}
            className="absolute -left-2 top-0 p-2 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-zinc-300" />
          </button>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2 bg-gradient-to-b from-zinc-50 to-zinc-400 bg-clip-text text-transparent">
            Player Lobby
          </h1>
          <p className="text-zinc-400">
            Enter your game code to join
          </p>
        </div>

        {/* Login Form */}
        <div className="rounded-2xl p-6 md:p-8 border border-zinc-800 bg-zinc-900/60 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Game Code
              </label>
              <input
                type="text"
                value={gameCode}
                onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                placeholder="Enter your game code"
                className="w-full px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-center font-mono text-lg tracking-wider"
                maxLength={8}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || !gameCode.trim()}
              className="w-full flex items-center justify-center px-4 py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-[0_0_0_1px_rgba(99,102,241,0.35)]"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Joining...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Join Game
                </>
              )}
            </button>
          </form>

          {/* Demo Codes */}
          <div className="mt-8 pt-6 border-t border-zinc-800">
            <div className="text-sm text-zinc-500 mb-3 text-center">
              Demo codes (from seed data):
            </div>
            <div className="space-y-2">
              {['Alice', 'Bob', 'Carol', 'Dave', 'Eve', 'Frank'].map((name, index) => (
                <div key={name} className="flex items-center justify-between text-sm">
                  <span className="text-zinc-300">{name}:</span>
                  <button
                    onClick={() => setGameCode(`DEMO${index + 1}`)}
                    className="font-mono text-indigo-400 hover:text-indigo-300"
                  >
                    DEMO{index + 1}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-2 gap-4 text-center">
          <div className="rounded-lg p-4 border border-zinc-800 bg-zinc-900/60">
            <Users className="w-8 h-8 mx-auto mb-2 text-indigo-400" />
            <div className="text-sm font-medium text-zinc-100">Multiplayer</div>
            <div className="text-xs text-zinc-500">Real-time gameplay</div>
          </div>
          <div className="rounded-lg p-4 border border-zinc-800 bg-zinc-900/60">
            <Trophy className="w-8 h-8 mx-auto mb-2 text-indigo-400" />
            <div className="text-sm font-medium text-zinc-100">Prizes</div>
            <div className="text-xs text-zinc-500">Win exciting rewards</div>
          </div>
        </div>
      </div>
    </div>
  )
}

