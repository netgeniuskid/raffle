'use client'

import { useState } from 'react'
import { GameMode } from '@/components/GameMode'
import { AdminDashboard } from '@/components/AdminDashboard'
import { PlayerLobby } from '@/components/PlayerLobby'

export default function Home() {
  const [mode, setMode] = useState<'select' | 'admin' | 'player'>('select')

  if (mode === 'admin') {
    return <AdminDashboard onBack={() => setMode('select')} />
  }

  if (mode === 'player') {
    return <PlayerLobby onBack={() => setMode('select')} />
  }

  return <GameMode onSelectMode={setMode} />
}











