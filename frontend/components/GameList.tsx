'use client'

import { Play, Square, Users, Clock, CheckCircle, XCircle, Trash2 } from 'lucide-react'
import { GameState } from '@/lib/api'

interface GameListProps {
  games: GameState[]
  selectedGame: GameState | null
  onSelectGame: (game: GameState) => void
  onStartGame: (gameId: string) => void
  onCancelGame: (gameId: string) => void
  onDeleteGame: (gameId: string) => void
  loading: boolean
}

export function GameList({ games, selectedGame, onSelectGame, onStartGame, onCancelGame, onDeleteGame, loading }: GameListProps) {
  const getStatusIcon = (status: GameState['status']) => {
    switch (status) {
      case 'DRAFT':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'WAITING':
        return <Users className="w-4 h-4 text-blue-500" />
      case 'IN_PROGRESS':
        return <Play className="w-4 h-4 text-green-500" />
      case 'ENDED':
        return <CheckCircle className="w-4 h-4 text-gray-500" />
      case 'CANCELED':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusText = (status: GameState['status']) => {
    switch (status) {
      case 'DRAFT':
        return 'Draft'
      case 'WAITING':
        return 'Waiting'
      case 'IN_PROGRESS':
        return 'In Progress'
      case 'ENDED':
        return 'Ended'
      case 'CANCELED':
        return 'Canceled'
      default:
        return 'Unknown'
    }
  }

  const canStart = (game: GameState) => {
    return game.status === 'DRAFT' || game.status === 'WAITING'
  }

  const canCancel = (game: GameState) => {
    return game.status === 'DRAFT' || game.status === 'WAITING' || game.status === 'IN_PROGRESS'
  }

  if (games.length === 0) {
    return (
      <div className="text-center text-zinc-500 py-8">
        <Users className="w-12 h-12 mx-auto mb-4 text-zinc-700" />
        <p>No games created yet</p>
        <p className="text-sm">Create your first game to get started</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {games.map((game) => (
        <div
          key={game.id}
          className={`p-4 rounded-lg border cursor-pointer transition-all ${
            selectedGame?.id === game.id
              ? 'border-indigo-500/40 bg-indigo-500/10'
              : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/60'
          }`}
          onClick={() => onSelectGame(game)}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="font-medium text-zinc-100 truncate">{game.name}</h3>
              <div className="flex items-center text-sm text-zinc-500 mt-1">
                {getStatusIcon(game.status)}
                <span className="ml-1">{getStatusText(game.status)}</span>
              </div>
            </div>
          </div>

          <div className="text-xs text-zinc-500 mb-3">
            <div>{game.totalCards} cards • {game.prizeCount} prize{game.prizeCount !== 1 ? 's' : ''}</div>
            <div>{game.players.length}/{game.playerSlots} players</div>
          </div>

          <div className="flex space-x-2">
            {canStart(game) && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onStartGame(game.id)
                }}
                disabled={loading}
                className="flex-1 flex items-center justify-center px-3 py-1 text-xs rounded border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-50 transition-colors"
              >
                <Play className="w-3 h-3 mr-1" />
                Start
              </button>
            )}
            {canCancel(game) && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onCancelGame(game.id)
                }}
                disabled={loading}
                className="flex-1 flex items-center justify-center px-3 py-1 text-xs rounded border border-rose-500/40 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 disabled:opacity-50 transition-colors"
              >
                <Square className="w-3 h-3 mr-1" />
                Cancel
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDeleteGame(game.id)
              }}
              disabled={loading}
              className="flex items-center justify-center px-3 py-1 text-xs rounded border border-zinc-700 bg-zinc-800/60 text-zinc-300 hover:bg-zinc-800 disabled:opacity-50 transition-colors"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}



