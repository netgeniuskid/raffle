'use client'

import { useState, useEffect } from 'react'
import { LogOut, Users, Trophy, Clock } from 'lucide-react'
import { Card } from './Card'
import { PickHistory } from './PickHistory'
import { gameService, Game, Player } from '@/lib/gameService'
import toast from 'react-hot-toast'

interface GameInterfaceProps {
  player: Player
  game: Game
  onLogout: () => void
  onGameUpdate: (game: Game) => void
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
    // Trigger shuffle animation on initial load
    setIsShuffling(true)
    setTimeout(() => setIsShuffling(false), 4000)

    // Update turn status
    setIsMyTurn(game.currentPlayerIndex === player.playerIndex && game.status === 'IN_PROGRESS')

    // Convert picks to pick history format
    const history = game.picks.map(pick => {
      const playerName = game.players.find(p => p.id === pick.playerId)?.username || 'Unknown'
      return {
        playerName,
        cardIndex: pick.cardIndex,
        wasPrize: pick.wasPrize,
        message: pick.wasPrize ? `Found ${pick.prizeNames.join(', ')}!` : 'No prize',
        prizeNames: pick.prizeNames,
        timestamp: new Date(pick.timestamp).toLocaleTimeString()
      }
    })
    setPickHistory(history)

  }, [game, player])

  const handleCardClick = async (cardIndex: number) => {
    if (!isMyTurn || picking || game.status !== 'IN_PROGRESS') return

    const card = game.cards[cardIndex]
    if (!card || card.isRevealed) return

    try {
      setPicking(true)
      const result = await gameService.pickCard(game.id!, player.id, cardIndex)
      
      if (result.success) {
        const message = result.wasPrize 
          ? `🎉 You found ${result.prizeNames.join(', ')}!` 
          : 'No prize this time'
        
        toast.success(message, { duration: 3000 })
        
        // Add to pick history
        const newPick = {
          playerName: player.username,
          cardIndex,
          wasPrize: result.wasPrize,
          message: result.wasPrize ? `Found ${result.prizeNames.join(', ')}!` : 'No prize',
          prizeNames: result.prizeNames,
          timestamp: new Date().toLocaleTimeString()
        }
        setPickHistory(prev => [newPick, ...prev])
      }
    } catch (error: any) {
      console.error('Error picking card:', error)
      toast.error(error.message || 'Failed to pick card')
    } finally {
      setPicking(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'text-yellow-400'
      case 'IN_PROGRESS': return 'text-green-400'
      case 'COMPLETED': return 'text-blue-400'
      case 'CANCELLED': return 'text-red-400'
      default: return 'text-zinc-400'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'Waiting to start'
      case 'IN_PROGRESS': return 'In progress'
      case 'COMPLETED': return 'Completed'
      case 'CANCELLED': return 'Cancelled'
      default: return status
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
      {/* Header */}
      <div className="bg-zinc-900/60 backdrop-blur-sm border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div>
                <h1 className="text-xl font-bold text-zinc-100">{game.name}</h1>
                <div className="flex items-center space-x-4 text-sm text-zinc-500">
                  <span className={`font-medium ${getStatusColor(game.status)}`}>
                    {getStatusText(game.status)}
                  </span>
                  <span className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{game.players.length}/{game.playerSlots} players</span>
                  </span>
                  {game.status === 'IN_PROGRESS' && (
                    <span className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>Turn: {game.players[game.currentPlayerIndex]?.username}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-zinc-400">
                Playing as: <span className="font-medium text-zinc-100">{player.username}</span>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 px-3 py-2 text-zinc-400 hover:text-zinc-100 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {game.status === 'DRAFT' ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-500/10 rounded-2xl mb-4">
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-100 mb-2">Waiting for Game to Start</h2>
            <p className="text-zinc-500">The admin will start the game soon. Stay tuned!</p>
          </div>
        ) : game.status === 'IN_PROGRESS' ? (
          <div className="space-y-8">
            {/* Game Status */}
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-green-500/10 rounded-full border border-green-500/20">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-400">Game in Progress</span>
              </div>
              {isMyTurn && (
                <div className="mt-4 inline-flex items-center space-x-2 px-4 py-2 bg-indigo-500/10 rounded-full border border-indigo-500/20">
                  <Trophy className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm font-medium text-indigo-400">Your Turn!</span>
                </div>
              )}
            </div>

            {/* Cards Grid */}
            <div className="bg-zinc-900/60 backdrop-blur-sm rounded-2xl border border-zinc-800 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-zinc-100">Cards</h2>
                <div className="text-sm text-zinc-500">
                  {game.cards.filter(c => !c.isRevealed).length} remaining
                </div>
              </div>
              
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

            {/* Pick History */}
            <div className="bg-zinc-900/60 backdrop-blur-sm rounded-2xl border border-zinc-800 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
              <h2 className="text-lg font-semibold text-zinc-100 mb-4">Recent Picks</h2>
              <PickHistory history={pickHistory} />
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-zinc-500/10 rounded-2xl mb-4">
              <Trophy className="w-8 h-8 text-zinc-400" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-100 mb-2">Game {game.status}</h2>
            <p className="text-zinc-500">This game has ended.</p>
          </div>
        )}
      </div>
    </div>
  )
}
