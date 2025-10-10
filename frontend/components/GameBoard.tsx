'use client'

import { GameState } from '@/lib/api'
import { Card } from './Card'

interface GameBoardProps {
  game: GameState
}

export function GameBoard({ game }: GameBoardProps) {
  const { cards, currentPlayerIndex, players, status } = game

  const getGridCols = () => {
    // Calculate optimal grid columns based on total cards
    const sqrt = Math.sqrt(cards.length)
    if (Number.isInteger(sqrt)) return sqrt
    return Math.ceil(sqrt)
  }

  const gridCols = getGridCols()

  return (
    <div className="space-y-6">
      {/* Game Status */}
      <div className="text-center">
        <h3 className="text-xl md:text-2xl font-bold tracking-tight text-zinc-100 mb-1">{game.name}</h3>
        <div className="text-sm text-zinc-500">
          Status: <span className="font-medium capitalize">{status.toLowerCase()}</span>
        </div>
        {status === 'IN_PROGRESS' && (
          <div className="text-sm text-indigo-400 mt-1">
            Current Turn: <span className="font-medium">{players[currentPlayerIndex]?.username}</span>
          </div>
        )}
      </div>

      {/* Players List */}
      <div className="rounded-lg p-4 border border-zinc-800 bg-zinc-900/60">
        <div className="text-sm font-medium text-zinc-300 mb-2">Players</div>
        <div className="flex flex-wrap gap-2">
          {players.map((player, index) => (
            <div
              key={player.id}
              className={`px-3 py-1 rounded-full text-xs font-medium border ${
                index === currentPlayerIndex && status === 'IN_PROGRESS'
                  ? 'border-indigo-500/40 bg-indigo-500/10 text-indigo-300'
                  : player.connected
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                  : 'border-zinc-800 bg-zinc-800/60 text-zinc-400'
              }`}
            >
              {player.username}
              {player.isWinner && ' 🏆'}
            </div>
          ))}
        </div>
      </div>

      {/* Cards Grid */}
      <div className="relative rounded-2xl p-5 md:p-6 border border-zinc-800 bg-zinc-900/60 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
        <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent" />
        <div className="relative flex items-center justify-between mb-4">
          <div className="text-sm font-medium text-zinc-300">Cards</div>
          <div className="text-xs px-2.5 py-1 rounded-full border border-zinc-800 bg-zinc-900/60 text-zinc-400">
            {cards.filter(c => !c.isRevealed).length} remaining
          </div>
        </div>
        <div
          className="grid gap-2 sm:gap-3"
          style={{
            gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
          }}
        >
      {Array.from({ length: cards.length }, (_, index) => {
        const card = cards.find(c => c.positionIndex === index);
        if (!card) return null;
        
        return (
          <div key={card.id} className="rounded-xl overflow-hidden">
            <Card card={card} />
          </div>
        );
      })}
        </div>
      </div>

      {/* Game Stats */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="rounded-lg p-3 border border-zinc-800 bg-zinc-900/60">
          <div className="text-zinc-500">Total Cards</div>
          <div className="font-semibold text-zinc-100">{cards.length}</div>
        </div>
        <div className="rounded-lg p-3 border border-zinc-800 bg-zinc-900/60">
          <div className="text-zinc-500">Revealed</div>
          <div className="font-semibold text-zinc-100">
            {cards.filter(c => c.isRevealed).length}
          </div>
        </div>
      </div>
    </div>
  )
}



