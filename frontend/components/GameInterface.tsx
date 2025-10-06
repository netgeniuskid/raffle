'use client'

import { useState, useEffect } from 'react'
import { LogOut, Users, Trophy, Clock } from 'lucide-react'
import { PlayerState, GameState } from '@/lib/api'
import { getSocket } from '@/lib/socket'
import { Card } from './Card'
import { PickHistory } from './PickHistory'
import toast from 'react-hot-toast'

interface GameInterfaceProps {
  player: PlayerState
  game: GameState
  onLogout: () => void
  onGameUpdate: (game: GameState) => void
}

export function GameInterface({ player, game, onLogout, onGameUpdate }: GameInterfaceProps) {
  const [isMyTurn, setIsMyTurn] = useState(false)
  const [picking, setPicking] = useState(false)
  const [isShuffling, setIsShuffling] = useState(false)
  const [pickHistory, setPickHistory] = useState<Array<{
    playerName: string
    cardIndex: number
    wasPrize: boolean
    message: string
    prizeNames: string[]
    timestamp: string
  }>>([])

  useEffect(() => {
    const socket = getSocket()
    if (!socket) return

    // Trigger shuffle animation on initial load (when player first joins)
    setIsShuffling(true)
    setTimeout(() => setIsShuffling(false), 4000)

    // Update turn status
    setIsMyTurn(game.currentPlayerIndex === player.playerIndex && game.status === 'IN_PROGRESS')

    // Socket event listeners
    const handleGameState = (gameState: GameState) => {
      onGameUpdate(gameState)
      setIsMyTurn(gameState.currentPlayerIndex === player.playerIndex && gameState.status === 'IN_PROGRESS')
    }

    const handleCardRevealed = (data: { cardIndex: number; playerId: string; wasPrize: boolean; message: string; prizeNames: string[] }) => {
      const playerName = game.players.find(p => p.id === data.playerId)?.username || 'Unknown'
      setPickHistory(prev => [{
        playerName,
        cardIndex: data.cardIndex,
        wasPrize: data.wasPrize,
        message: data.message,
        prizeNames: data.prizeNames,
        timestamp: new Date().toLocaleTimeString()
      }, ...prev])
    }

    const handleTurnChanged = (data: { currentPlayerIndex: number }) => {
      setIsMyTurn(data.currentPlayerIndex === player.playerIndex && game.status === 'IN_PROGRESS')
    }

    const handleGameEnded = (data: { winnerPlayerId: string; cardIndex: number }) => {
      const winner = game.players.find(p => p.id === data.winnerPlayerId)
      if (winner) {
        toast.success(`🎉 ${winner.username} won the game!`, { duration: 5000 })
      }
    }

    const handlePlayerConnected = (data: { playerId: string; username: string }) => {
      toast.success(`${data.username} joined the game`)
    }

    const handlePlayerDisconnected = (data: { playerId: string; username: string }) => {
      toast.error(`${data.username} left the game`)
    }

    const handleCardsShuffled = (data: { message: string; shuffledBy: string }) => {
      toast.success(`${data.message} (shuffled by ${data.shuffledBy})`, { duration: 4000 })
      setIsShuffling(true)
      setTimeout(() => setIsShuffling(false), 4000)
    }

    const handleError = (error: string) => {
      toast.error(error)
    }

    socket.on('game:state', handleGameState)
    socket.on('card:revealed', handleCardRevealed)
    socket.on('turn:changed', handleTurnChanged)
    socket.on('game:ended', handleGameEnded)
    socket.on('player:connected', handlePlayerConnected)
    socket.on('player:disconnected', handlePlayerDisconnected)
    socket.on('cards:shuffled', handleCardsShuffled)
    socket.on('error', handleError)

    return () => {
      socket.off('game:state', handleGameState)
      socket.off('card:revealed', handleCardRevealed)
      socket.off('turn:changed', handleTurnChanged)
      socket.off('game:ended', handleGameEnded)
      socket.off('player:connected', handlePlayerConnected)
      socket.off('player:disconnected', handlePlayerDisconnected)
      socket.off('cards:shuffled', handleCardsShuffled)
      socket.off('error', handleError)
    }
  }, [game, player, onGameUpdate])

  const handleCardClick = async (cardIndex: number) => {
    if (!isMyTurn || picking || game.status !== 'IN_PROGRESS') return

    const card = game.cards.find(c => c.positionIndex === cardIndex)
    if (!card || card.isRevealed) return

    try {
      setPicking(true)
      const socket = getSocket()
      if (!socket) throw new Error('Not connected')

      socket.emit('pick:card', { cardIndex }, (result: { error?: string } | { wasPrize: boolean; gameEnded: boolean; nextPlayerIndex?: number; winner?: { id: string } }) => {
        if ('error' in result) {
          const errorMessage = typeof result.error === 'string' ? result.error : (result as any).error?.message || 'Failed to pick card'
          toast.error(errorMessage)
        } else {
          toast.success('Card picked!')
        }
        setPicking(false)
      })
    } catch (error: any) {
      toast.error(error.message || 'Failed to pick card')
      setPicking(false)
    }
  }

  const getGridCols = () => {
    const sqrt = Math.sqrt(game.cards.length)
    if (Number.isInteger(sqrt)) return sqrt
    return Math.ceil(sqrt)
  }

  const gridCols = getGridCols()

  return (
    <div className="min-h-screen">
      {/* Top Navigation with game info */}
      <div className="border-b border-zinc-800 bg-zinc-900/60 backdrop-blur supports-[backdrop-filter]:bg-zinc-900/50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3 justify-between items-center h-16">
            <div className="flex items-center gap-3 min-w-0">
              <h1 className="text-lg md:text-xl font-bold text-zinc-100 truncate">{game.name}</h1>
              <div className="hidden md:inline-flex px-2.5 py-1 rounded-full text-xs font-medium border border-zinc-800 bg-zinc-900/60 text-zinc-400 capitalize">
                {game.status.toLowerCase()}
              </div>
              <div className="hidden md:inline-flex px-2.5 py-1 rounded-full text-xs font-medium border border-zinc-800 bg-zinc-900/60 text-zinc-400">
                {game.cards.filter(c => !c.isRevealed).length} remaining
              </div>
              {game.status === 'IN_PROGRESS' && (
                <div className="hidden md:inline-flex px-2.5 py-1 rounded-full text-xs font-medium border border-indigo-500/40 bg-indigo-500/10 text-indigo-300">
                  Turn: {game.players[game.currentPlayerIndex]?.username}
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 rounded-full text-sm font-medium border border-indigo-500/40 bg-indigo-500/10 text-indigo-300">
                {player.username}
              </div>
              <button
                onClick={onLogout}
                className="flex items-center px-3 py-2 text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Full-width Board */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Turn Indicator */}
        {game.status === 'IN_PROGRESS' && (
          <div className={`mb-4 p-3 rounded-lg text-center border ${
            isMyTurn
              ? 'border-indigo-500/40 bg-indigo-500/10 text-indigo-300'
              : 'border-zinc-800 bg-zinc-900/60 text-zinc-400'
          }`}>
            {isMyTurn ? (
              <div className="flex items-center justify-center">
                <Clock className="w-4 h-4 mr-2" />
                Your turn! Pick a card
              </div>
            ) : (
              <div>
                Waiting for {game.players[game.currentPlayerIndex]?.username}&apos;s turn
              </div>
            )}
          </div>
        )}

        <div className="rounded-2xl p-4 md:p-6 border border-zinc-800 bg-zinc-900/60 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] relative">
          <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent" />
          
          {/* Shuffle pile indicator */}
          {isShuffling && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
              <div className="w-16 h-20 bg-indigo-500/20 border-2 border-indigo-400/40 rounded-lg flex items-center justify-center">
                <div className="text-indigo-300 text-xs font-bold">SHUFFLING</div>
              </div>
            </div>
          )}
          
          <div
            className="relative grid gap-3 sm:gap-4"
            style={{
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            }}
          >
            {game.cards.map((card) => (
              <div
                key={card.id}
                onClick={() => handleCardClick(card.positionIndex)}
                className={`group cursor-pointer transition-transform ${
                  isMyTurn && !card.isRevealed && !picking
                    ? 'hover:scale-[1.03]'
                    : 'cursor-not-allowed opacity-50'
                }`}
              >
                <div className="rounded-xl overflow-hidden shadow-[0_0_0_1px_rgba(255,255,255,0.03)] group-hover:shadow-[0_0_0_1px_rgba(99,102,241,0.35),0_20px_40px_-20px_rgba(99,102,241,0.35)] transition-shadow">
                  <Card card={card} isShuffling={isShuffling} />
                </div>
              </div>
            ))}
          </div>

          {picking && (
            <div className="mt-4 text-center">
              <div className="inline-flex items-center text-indigo-300">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-400 mr-2"></div>
                Picking card...
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Optional: Recent Picks below full-width board */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="rounded-2xl p-6 border border-zinc-800 bg-zinc-900/60">
          <h2 className="text-lg font-semibold text-zinc-100 mb-4">Recent Picks</h2>
          <PickHistory history={pickHistory} />
        </div>
      </div>
    </div>
  )
}

