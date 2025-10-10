'use client'

import { useEffect, useState } from 'react'
import { gameService } from '@/lib/gameService'

export default function TestGameState() {
  const [games, setGames] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const loadGames = async () => {
    setLoading(true)
    try {
      const firebaseGames = await gameService.getGames()
      setGames(firebaseGames)
      console.log('Loaded games:', firebaseGames)
    } catch (error) {
      console.error('Error loading games:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadGames()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-zinc-100 mb-6">Game State Test</h1>
        
        <div className="mb-4">
          <button 
            onClick={loadGames}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Refresh Games'}
          </button>
        </div>

        <div className="space-y-4">
          {games.map((game) => (
            <div key={game.id} className="bg-zinc-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-zinc-100 mb-2">{game.name}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-zinc-500">Status</div>
                  <div className="text-zinc-100 font-medium">{game.status}</div>
                </div>
                <div>
                  <div className="text-zinc-500">Cards Count</div>
                  <div className="text-zinc-100 font-medium">{game.cards?.length || 0}</div>
                </div>
                <div>
                  <div className="text-zinc-500">Players Count</div>
                  <div className="text-zinc-100 font-medium">{game.players?.length || 0}</div>
                </div>
                <div>
                  <div className="text-zinc-500">Created</div>
                  <div className="text-zinc-100 font-medium">
                    {game.createdAt ? new Date(game.createdAt.seconds * 1000).toLocaleString() : 'Unknown'}
                  </div>
                </div>
              </div>
              
              {game.cards && game.cards.length > 0 && (
                <div className="mt-4">
                  <div className="text-zinc-500 text-sm mb-2">Cards Preview (first 5):</div>
                  <div className="flex gap-2">
                    {game.cards.slice(0, 5).map((card: any, index: number) => (
                      <div key={card.id} className="w-16 h-16 bg-zinc-700 rounded border flex items-center justify-center text-xs">
                        {card.isPrize ? '🎁' : '❓'}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {games.length === 0 && !loading && (
          <div className="text-center py-8 text-zinc-500">
            No games found. Create a game in the admin dashboard first.
          </div>
        )}
      </div>
    </div>
  )
}
