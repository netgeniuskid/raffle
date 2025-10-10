'use client'

import { useEffect, useState } from 'react'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export default function TestGameCodes() {
  const [games, setGames] = useState<any[]>([])
  const [playerCodes, setPlayerCodes] = useState<any[]>([])
  const [testCode, setTestCode] = useState('')
  const [testResult, setTestResult] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Load games
      const gamesRef = collection(db, 'games')
      const gamesSnapshot = await getDocs(gamesRef)
      const gamesData = gamesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setGames(gamesData)
      
      // Load player codes
      const codesRef = collection(db, 'playerCodes')
      const codesSnapshot = await getDocs(codesRef)
      const codesData = codesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setPlayerCodes(codesData)
      
      console.log('Games:', gamesData)
      console.log('Player Codes:', codesData)
      
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const testGameCode = async () => {
    if (!testCode.trim()) return
    
    try {
      setLoading(true)
      setTestResult('Testing...')
      
      const codesQuery = query(collection(db, 'playerCodes'), where('code', '==', testCode.trim()))
      const codesSnapshot = await getDocs(codesQuery)
      
      if (codesSnapshot.empty) {
        setTestResult(`❌ No player codes found for: ${testCode}`)
      } else {
        const codeData = codesSnapshot.docs[0].data()
        setTestResult(`✅ Found player code: ${JSON.stringify(codeData, null, 2)}`)
      }
      
    } catch (error: any) {
      setTestResult(`❌ Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-zinc-100 mb-6">Game Codes Debug Tool</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Test Game Code */}
          <div className="bg-zinc-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-zinc-100 mb-4">Test Game Code</h2>
            <div className="space-y-4">
              <input
                type="text"
                value={testCode}
                onChange={(e) => setTestCode(e.target.value)}
                placeholder="Enter game code to test"
                className="w-full p-3 bg-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-400"
              />
              <button
                onClick={testGameCode}
                disabled={loading}
                className="w-full p-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-600 rounded-lg text-white font-medium"
              >
                {loading ? 'Testing...' : 'Test Code'}
              </button>
              {testResult && (
                <div className="p-3 bg-zinc-700 rounded-lg">
                  <pre className="text-sm text-zinc-300 whitespace-pre-wrap">{testResult}</pre>
                </div>
              )}
            </div>
          </div>

          {/* Games List */}
          <div className="bg-zinc-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-zinc-100 mb-4">Games ({games.length})</h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {games.map(game => (
                <div key={game.id} className="p-3 bg-zinc-700 rounded text-sm">
                  <div className="text-zinc-300">
                    <strong>{game.name || 'Unnamed Game'}</strong> - {game.status || 'No status'}
                  </div>
                  <div className="text-zinc-500 text-xs">ID: {game.id}</div>
                  <div className="text-zinc-500 text-xs">Players: {game.players?.length || 0}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Player Codes List */}
          <div className="bg-zinc-800 rounded-lg p-6 lg:col-span-2">
            <h2 className="text-xl font-semibold text-zinc-100 mb-4">Player Codes ({playerCodes.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
              {playerCodes.map(code => (
                <div key={code.id} className="p-3 bg-zinc-700 rounded text-sm">
                  <div className="text-zinc-300">
                    <strong>Code:</strong> {code.code}
                  </div>
                  <div className="text-zinc-500 text-xs">
                    <strong>Username:</strong> {code.username}
                  </div>
                  <div className="text-zinc-500 text-xs">
                    <strong>Game ID:</strong> {code.gameId}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

