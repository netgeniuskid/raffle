'use client'

import { useState, useEffect } from 'react'
import { LogOut, Users, Trophy, Clock } from 'lucide-react'
import { Card } from './Card'
import { PickHistory } from './PickHistory'
import { gameService, Game, Player } from '@/lib/gameService'
import { GameState } from '@/lib/api'
import toast from 'react-hot-toast'

// Conversion function
const convertGameToGameState = (game: Game): GameState => ({
  id: game.id,
  name: game.name,
  status: game.status as any,
  totalCards: game.totalCards,
  prizeCount: game.prizeCount,
  prizeNames: game.prizeNames,
  playerSlots: game.playerSlots,
  cards: game.cards || [],
  players: game.players || [],
  currentPlayerIndex: game.currentPlayerIndex || 0,
  createdAt: game.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
  startedAt: undefined,
  endedAt: undefined
})

interface GameInterfaceProps {
  player: Player
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
    // Trigger shuffle animation on initial load
    setIsShuffling(true)
    setTimeout(() => setIsShuffling(false), 4000)

    // Update turn status
    setIsMyTurn(game.currentPlayerIndex === player.playerIndex && game.status === 'IN_PROGRESS')

    // Initialize empty pick history since GameState doesn't have picks
    setPickHistory([])

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
          
          if (result.gameEnded) {
            // Game ended - show winner message and refresh game state
            toast.success(`🎉 Game Over! You won!`, { duration: 5000 })
            setTimeout(async () => {
              try {
                const updatedGame = await gameService.getGame(game.id!)
                if (updatedGame) {
                  const gameState = convertGameToGameState(updatedGame as any)
                  onGameUpdate(gameState)
                }
              } catch (error) {
                console.error('Error refreshing game state:', error)
              }
            }, 1000)
          } else {
            // Continue game - trigger shuffle animation and refresh game state
            setIsShuffling(true)
            setTimeout(async () => {
              try {
                const updatedGame = await gameService.getGame(game.id!)
                if (updatedGame) {
                  const gameState = convertGameToGameState(updatedGame as any)
                  onGameUpdate(gameState)
                }
              } catch (error) {
                console.error('Error refreshing game state:', error)
              }
              setIsShuffling(false)
            }, 2000) // Longer animation for shuffle effect
          }
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

      {/* Debug Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="mb-4 p-4 bg-zinc-800 rounded-lg text-xs text-zinc-400">
          <div className="flex justify-between items-center mb-2">
            <div className="font-semibold text-zinc-300">Debug Info</div>
            <button 
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.location.reload()
                }
              }} 
              className="px-2 py-1 bg-zinc-700 hover:bg-zinc-600 rounded text-xs"
            >
              Refresh Page
            </button>
          </div>
          <div>Game Status: {game.status}</div>
          <div>Cards Count: {game.cards?.length || 0}</div>
          <div>Players Count: {game.players?.length || 0}</div>
          <div>Current Player Index: {game.currentPlayerIndex}</div>
          <div>Is My Turn: {isMyTurn ? 'Yes' : 'No'}</div>
          <div>Player Index: {player.playerIndex}</div>
          <div>Current Player Index: {game.currentPlayerIndex}</div>
          <div>Game Status: {game.status}</div>
          <div>Card Positions: {game.cards.slice(0, 5).map(c => `${c.positionIndex}(${c.isRevealed ? 'R' : 'U'})`).join(', ')}</div>
          <div>Unrevealed Positions: {game.cards.filter(c => !c.isRevealed).slice(0, 5).map(c => `${c.positionIndex}(${c.isRevealed ? 'R' : 'U'})`).join(', ')}</div>
          <div>Last Updated: {new Date().toLocaleTimeString()}</div>
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
        ) : game.status === 'ENDED' ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-500/10 rounded-2xl mb-4">
              <Trophy className="w-8 h-8 text-yellow-400" />
            </div>
            <h2 className="text-3xl font-bold text-yellow-400 mb-2">🎉 Game Over! 🎉</h2>
            <p className="text-zinc-300 text-lg mb-4">Congratulations! A prize was found!</p>
            <p className="text-zinc-500">The game has ended. Thank you for playing!</p>
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
                {Array.from({ length: game.totalCards }, (_, index) => {
                  const card = game.cards.find(c => c.positionIndex === index);
                  if (!card) return null;
                  
                  return (
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
                  );
                })}
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
