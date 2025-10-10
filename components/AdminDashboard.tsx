'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Plus, Play, Square, Download, Users, Gamepad2, Trash2 } from 'lucide-react'
import { adminAPI, CreateGameRequest, GameState } from '@/lib/api'
import { CreateGameForm } from './CreateGameForm'
import { GameList } from './GameList'
import { GameBoard } from './GameBoard'
import { PlayerCodes } from './PlayerCodes'
import toast from 'react-hot-toast'

interface AdminDashboardProps {
  onBack: () => void
}

export function AdminDashboard({ onBack }: AdminDashboardProps) {
  const [games, setGames] = useState<GameState[]>([])
  const [selectedGame, setSelectedGame] = useState<GameState | null>(null)
  const [playerCodes, setPlayerCodes] = useState<Array<{ username: string; code: string }>>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [loading, setLoading] = useState(false)

  // Load existing games from the server on mount
  useEffect(() => {
    const loadGames = async () => {
      try {
        setLoading(true)
        const { games } = await adminAPI.listGames()
        // Fetch full game details so the board has players/cards
        const detailed = await Promise.all(
          games.map(async (g) => {
            try {
              const { game } = await adminAPI.getGame(g.id)
              return game
            } catch {
              return null
            }
          })
        )
        const fullGames = detailed.filter((g): g is GameState => Boolean(g))
        setGames(fullGames)
        if (fullGames.length > 0) {
          setSelectedGame(fullGames[0])
        }
      } catch (error: any) {
        // Non-fatal; allow UI to continue
      } finally {
        setLoading(false)
      }
    }
    loadGames()
  }, [])

  const handleCreateGame = async (data: CreateGameRequest) => {
    try {
      setLoading(true)
      const response = await adminAPI.createGame(data)
      setGames(prev => [response.game, ...prev])
      setPlayerCodes(response.playerCodes)
      setSelectedGame(response.game)
      setShowCreateForm(false)
      toast.success('Game created successfully!')
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || error.message || 'Failed to create game'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleStartGame = async (gameId: string) => {
    try {
      setLoading(true)
      const response = await adminAPI.startGame(gameId)
      setGames(prev => prev.map(g => g.id === gameId ? response.game : g))
      setSelectedGame(response.game)
      toast.success('Game started!')
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || error.message || 'Failed to start game'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelGame = async (gameId: string) => {
    try {
      setLoading(true)
      await adminAPI.cancelGame(gameId)
      setGames(prev => prev.map(g => g.id === gameId ? { ...g, status: 'CANCELED' } : g))
      if (selectedGame?.id === gameId) {
        setSelectedGame(prev => prev ? { ...prev, status: 'CANCELED' } : null)
      }
      toast.success('Game cancelled')
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || error.message || 'Failed to cancel game'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const exportCodes = () => {
    if (playerCodes.length === 0) return

    const csvContent = [
      'Username,Game Code',
      ...playerCodes.map(p => `${p.username},${p.code}`)
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    if (typeof window !== 'undefined') {
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `game-codes-${selectedGame?.name || 'game'}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    }
  }

  const handleDeleteGame = async (gameId: string) => {
    try {
      if (!confirm('Delete this game? This cannot be undone.')) return
      setLoading(true)
      await adminAPI.deleteGame(gameId)
      setGames(prev => prev.filter(g => g.id !== gameId))
      if (selectedGame?.id === gameId) {
        setSelectedGame(null)
        setPlayerCodes([])
      }
      toast.success('Game deleted')
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || error.message || 'Failed to delete game'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-zinc-900/60 backdrop-blur supports-[backdrop-filter]:bg-zinc-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={onBack}
                className="mr-4 p-2 rounded-lg hover:bg-zinc-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-zinc-300" />
              </button>
              <h1 className="text-2xl font-bold text-zinc-100">Admin Dashboard</h1>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors shadow-[0_0_0_1px_rgba(99,102,241,0.35)]"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Game
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Game List */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl p-6 border border-zinc-800 bg-zinc-900/60 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
              <h2 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center">
                <Gamepad2 className="w-5 h-5 mr-2 text-zinc-400" />
                Games
              </h2>
              <GameList
                games={games}
                selectedGame={selectedGame}
                onSelectGame={setSelectedGame}
                onStartGame={handleStartGame}
                onCancelGame={handleCancelGame}
                onDeleteGame={handleDeleteGame}
                loading={loading}
              />
            </div>
          </div>

          {/* Center: Game Board */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl p-6 border border-zinc-800 bg-zinc-900/60 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
              <h2 className="text-lg font-semibold text-zinc-100 mb-4">
                Game Board
              </h2>
              {selectedGame ? (
                <GameBoard game={selectedGame} />
              ) : (
                <div className="text-center text-zinc-500 py-12">
                  Select a game to view the board
                </div>
              )}
            </div>
          </div>

          {/* Right: Player Codes */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl p-6 border border-zinc-800 bg-zinc-900/60 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-zinc-100 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-zinc-400" />
                  Player Codes
                </h2>
                {playerCodes.length > 0 && (
                  <button
                    onClick={exportCodes}
                    className="flex items-center px-3 py-1 text-sm rounded border border-zinc-800 bg-zinc-800/60 text-zinc-300 hover:bg-zinc-800"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Export
                  </button>
                )}
              </div>
              <PlayerCodes codes={playerCodes} />
            </div>
          </div>
        </div>
      </div>

      {/* Create Game Modal */}
      {showCreateForm && (
        <CreateGameForm
          onSubmit={handleCreateGame}
          onClose={() => setShowCreateForm(false)}
          loading={loading}
        />
      )}
    </div>
  )
}

