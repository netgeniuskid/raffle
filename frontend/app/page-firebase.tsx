'use client'

import { useState } from 'react'
import { Gamepad2, Settings, Users } from 'lucide-react'
import { AdminDashboardFirebase } from '@/components/AdminDashboardFirebase'
import { PlayerLobbyFirebase } from '@/components/PlayerLobbyFirebase'

export default function Home() {
  const [currentView, setCurrentView] = useState<'menu' | 'admin' | 'player'>('menu')

  if (currentView === 'admin') {
    return <AdminDashboardFirebase onBack={() => setCurrentView('menu')} />
  }

  if (currentView === 'player') {
    return <PlayerLobbyFirebase onBack={() => setCurrentView('menu')} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-500/10 rounded-3xl mb-6">
            <Gamepad2 className="w-10 h-10 text-indigo-400" />
          </div>
          <h1 className="text-4xl font-bold text-zinc-100 mb-2">Razz</h1>
          <p className="text-zinc-500">Card Reveal Game</p>
        </div>

        {/* Menu Options */}
        <div className="space-y-4">
          <button
            onClick={() => setCurrentView('admin')}
            className="w-full flex items-center space-x-4 p-6 bg-zinc-900/60 backdrop-blur-sm rounded-2xl border border-zinc-800 hover:border-zinc-700 transition-all group"
          >
            <div className="flex items-center justify-center w-12 h-12 bg-indigo-500/10 rounded-xl group-hover:bg-indigo-500/20 transition-colors">
              <Settings className="w-6 h-6 text-indigo-400" />
            </div>
            <div className="text-left">
              <h2 className="text-lg font-semibold text-zinc-100">Admin Dashboard</h2>
              <p className="text-sm text-zinc-500">Create and manage games</p>
            </div>
          </button>

          <button
            onClick={() => setCurrentView('player')}
            className="w-full flex items-center space-x-4 p-6 bg-zinc-900/60 backdrop-blur-sm rounded-2xl border border-zinc-800 hover:border-zinc-700 transition-all group"
          >
            <div className="flex items-center justify-center w-12 h-12 bg-green-500/10 rounded-xl group-hover:bg-green-500/20 transition-colors">
              <Users className="w-6 h-6 text-green-400" />
            </div>
            <div className="text-left">
              <h2 className="text-lg font-semibold text-zinc-100">Join Game</h2>
              <p className="text-sm text-zinc-500">Enter game code to play</p>
            </div>
          </button>
        </div>

        {/* Features */}
        <div className="mt-12 p-6 bg-zinc-900/40 rounded-xl border border-zinc-800">
          <h3 className="text-sm font-medium text-zinc-300 mb-3">Features</h3>
          <ul className="text-xs text-zinc-500 space-y-2">
            <li className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
              <span>Real-time multiplayer</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
              <span>Persistent game state</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
              <span>Live card reveals</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
              <span>Game history tracking</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
