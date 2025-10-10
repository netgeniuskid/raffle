'use client'

import { useState } from 'react'
import { Gamepad2, Settings, Users } from 'lucide-react'

interface GameModeProps {
  onSelectMode: (mode: 'admin' | 'player') => void
}

export function GameMode({ onSelectMode }: GameModeProps) {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent blur-3xl" />
      <div className="max-w-5xl mx-auto w-full px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-3 bg-gradient-to-b from-zinc-50 to-zinc-400 bg-clip-text text-transparent">
            Razz
          </h1>
          <p className="text-lg md:text-xl text-zinc-400">
            Turn-based card reveal with real-time multiplayer
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          <button
            onClick={() => onSelectMode('admin')}
            className="group rounded-2xl p-6 md:p-8 transition-all duration-300 bg-zinc-900/60 hover:bg-zinc-900/80 border border-zinc-800 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] hover:shadow-[0_0_0_1px_rgba(99,102,241,0.35),0_20px_50px_-20px_rgba(99,102,241,0.35)]"
          >
            <div className="text-center">
              <div className="w-16 h-16 rounded-xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center mx-auto mb-5 group-hover:bg-indigo-500/25 group-hover:border-indigo-500/40 transition-colors">
                <Settings className="w-8 h-8 text-indigo-400" />
              </div>
              <h2 className="text-2xl font-semibold text-zinc-100 mb-2">
                Admin Dashboard
              </h2>
              <p className="text-zinc-400 mb-4">
                Create games, manage players, and control the game flow
              </p>
              <div className="text-sm text-zinc-500 leading-relaxed">
                • Create and configure games<br />
                    • Generate player codes<br />
                    • Monitor game progress<br />
                    • Control game state
              </div>
            </div>
          </button>

          <button
            onClick={() => onSelectMode('player')}
            className="group rounded-2xl p-6 md:p-8 transition-all duration-300 bg-zinc-900/60 hover:bg-zinc-900/80 border border-zinc-800 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] hover:shadow-[0_0_0_1px_rgba(99,102,241,0.35),0_20px_50px_-20px_rgba(99,102,241,0.35)]"
          >
            <div className="text-center">
              <div className="w-16 h-16 rounded-xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center mx-auto mb-5 group-hover:bg-indigo-500/25 group-hover:border-indigo-500/40 transition-colors">
                <Users className="w-8 h-8 text-indigo-400" />
              </div>
              <h2 className="text-2xl font-semibold text-zinc-100 mb-2">
                Player Lobby
              </h2>
              <p className="text-zinc-400 mb-4">
                Join games with your code and play with others
              </p>
              <div className="text-sm text-zinc-500 leading-relaxed">
                • Enter game code to join<br />
                    • Real-time multiplayer<br />
                    • Turn-based gameplay<br />
                    • Live game updates
              </div>
            </div>
          </button>
        </div>

        <div className="text-center mt-14">
          <p className="text-zinc-500 text-sm">
            Built with Next.js, Socket.IO, and PostgreSQL
          </p>
        </div>
      </div>
    </div>
  )
}



