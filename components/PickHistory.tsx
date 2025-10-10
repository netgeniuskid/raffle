'use client'

import { Trophy, X } from 'lucide-react'

interface PickHistoryProps {
  history: Array<{
    playerName: string
    cardIndex: number
    wasPrize: boolean
    message: string
    prizeNames: string[]
    timestamp: string
  }>
}

export function PickHistory({ history }: PickHistoryProps) {
  if (history.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <div className="text-sm">No picks yet</div>
        <div className="text-xs mt-1">Picks will appear here as players take turns</div>
      </div>
    )
  }

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {history.map((pick, index) => (
        <div
          key={index}
          className={`p-3 rounded-lg border ${
            pick.wasPrize
              ? 'bg-yellow-50 border-yellow-200'
              : 'bg-gray-50 border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center">
              {pick.wasPrize ? (
                <Trophy className="w-4 h-4 text-yellow-600 mr-2" />
              ) : (
                <X className="w-4 h-4 text-gray-500 mr-2" />
              )}
              <span className="font-medium text-gray-900">{pick.playerName}</span>
            </div>
            <span className="text-xs text-gray-500">{pick.timestamp}</span>
          </div>
          <div className="text-sm text-gray-600">
            Card #{pick.cardIndex + 1}
          </div>
          <div className={`text-sm font-medium ${pick.wasPrize ? 'text-yellow-600' : 'text-gray-500'}`}>
            {pick.message}
            {pick.wasPrize && pick.prizeNames.length > 0 && (
              <div className="text-xs mt-1 text-yellow-700">
                {pick.prizeNames.join(', ')}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}




