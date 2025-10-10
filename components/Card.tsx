'use client'

import { CardState } from '@/lib/api'
import { useEffect, useState } from 'react'

interface CardProps {
  card: CardState
  isShuffling?: boolean
}

export function Card({ card, isShuffling = false }: CardProps) {
  const { isRevealed, isPrize, positionIndex } = card
  const [shuffleClass, setShuffleClass] = useState('')

  useEffect(() => {
    if (isShuffling) {
      setShuffleClass('card-shuffling')
      const timer = setTimeout(() => {
        setShuffleClass('')
      }, 4000) // Animation duration
      return () => clearTimeout(timer)
    }
  }, [isShuffling])

  return (
    <div className={`card-flip aspect-square ${isRevealed ? 'card-flipped' : ''} ${shuffleClass}`}>
      <div className={`card-inner`}>
        {/* Card Back */}
        <div className="card-back border border-zinc-800 bg-zinc-900/80 shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_10px_30px_-15px_rgba(0,0,0,0.6)]">
          <div className="text-center">
            <div className="text-lg font-bold text-zinc-200">?</div>
            <div className="text-xs text-zinc-500">{positionIndex + 1}</div>
          </div>
        </div>

        {/* Card Front */}
        <div className={`card-front ${isPrize ? 'card-prize' : 'card-empty'} border border-zinc-800 shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_10px_30px_-15px_rgba(0,0,0,0.6)]`}
        >
          <div className="text-center">
            {isPrize ? (
              <>
                <div className="text-2xl mb-1">🏆</div>
                <div className="text-sm font-bold">You&apos;ve Won!</div>
              </>
            ) : (
              <>
                <div className="text-lg mb-1">❌</div>
                <div className="text-xs">Try Again!</div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}



