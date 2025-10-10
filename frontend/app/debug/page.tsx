'use client'

import { useEffect, useState } from 'react'
import { collection, addDoc, getDocs, doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export default function FirebaseDebugger() {
  const [status, setStatus] = useState('Initializing...')
  const [logs, setLogs] = useState<string[]>([])
  const [games, setGames] = useState<any[]>([])
  const [testResult, setTestResult] = useState('')

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  useEffect(() => {
    const debugFirebase = async () => {
      try {
        addLog('Starting Firebase debug...')
        
        addLog('Using centralized Firebase configuration...')
        addLog('Firebase already initialized via lib/firebase.ts')
        
        // Test reading from Firestore
        addLog('Testing Firestore read...')
        try {
          const gamesRef = collection(db, 'games')
          const snapshot = await getDocs(gamesRef)
          const gamesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
          setGames(gamesData)
          addLog(`✅ Read test successful! Found ${snapshot.docs.length} games`)
        } catch (error: any) {
          addLog(`❌ Read test failed: ${error.message}`)
          throw error
        }
        
        // Test writing to Firestore
        addLog('Testing Firestore write...')
        try {
          const testDocRef = await addDoc(collection(db, 'test'), {
            message: 'Debug test from Vercel',
            timestamp: serverTimestamp(),
            testId: Math.random().toString(36).substr(2, 9),
            createdAt: new Date().toISOString()
          })
          addLog(`✅ Write test successful! Document ID: ${testDocRef.id}`)
          setTestResult('✅ Write test successful!')
        } catch (error: any) {
          addLog(`❌ Write test failed: ${error.message}`)
          setTestResult(`❌ Write test failed: ${error.message}`)
        }
        
        // Test writing a game
        addLog('Testing game creation...')
        try {
          const gameData = {
            name: 'Debug Test Game',
            status: 'DRAFT',
            totalCards: 20,
            prizeCount: 3,
            prizeNames: ['Prize 1', 'Prize 2', 'Prize 3'],
            playerSlots: 4,
            cards: [],
            players: [],
            currentPlayerIndex: 0,
            picks: [],
            adminId: 'debug-admin',
            createdAt: serverTimestamp()
          }
          
          const gameRef = await addDoc(collection(db, 'games'), gameData)
          addLog(`✅ Game creation test successful! Game ID: ${gameRef.id}`)
          
          // Read it back to verify
          const gameDoc = await getDocs(collection(db, 'games'))
          addLog(`✅ Verification: Found ${gameDoc.docs.length} games after creation`)
          
        } catch (error: any) {
          addLog(`❌ Game creation test failed: ${error.message}`)
        }
        
        setStatus('Debug complete!')
        
      } catch (error: any) {
        addLog(`❌ Critical error: ${error.message}`)
        setStatus(`Error: ${error.message}`)
      }
    }
    
    debugFirebase()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-zinc-100 mb-6">Firebase Debugger</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status */}
          <div className="bg-zinc-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-zinc-100 mb-4">Status</h2>
            <p className="text-zinc-300 mb-4">{status}</p>
            {testResult && (
              <div className="p-3 bg-zinc-700 rounded">
                <p className="text-zinc-300">{testResult}</p>
              </div>
            )}
          </div>

          {/* Environment Variables */}
          <div className="bg-zinc-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-zinc-100 mb-4">Environment Variables</h2>
            <div className="space-y-2 text-sm">
              <p className="text-zinc-400">API Key: {process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✅ Set' : '❌ Missing'}</p>
              <p className="text-zinc-400">Project ID: {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '❌ Missing'}</p>
              <p className="text-zinc-400">Auth Domain: {process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '❌ Missing'}</p>
              <p className="text-zinc-400">Storage Bucket: {process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '❌ Missing'}</p>
            </div>
          </div>

          {/* Logs */}
          <div className="bg-zinc-800 rounded-lg p-6 lg:col-span-2">
            <h2 className="text-xl font-semibold text-zinc-100 mb-4">Debug Logs</h2>
            <div className="bg-zinc-900 rounded p-4 max-h-64 overflow-y-auto">
              {logs.map((log, index) => (
                <div key={index} className="text-sm text-zinc-300 mb-1 font-mono">
                  {log}
                </div>
              ))}
            </div>
          </div>

          {/* Games List */}
          {games.length > 0 && (
            <div className="bg-zinc-800 rounded-lg p-6 lg:col-span-2">
              <h2 className="text-xl font-semibold text-zinc-100 mb-4">Existing Games ({games.length})</h2>
              <div className="space-y-2">
                {games.map(game => (
                  <div key={game.id} className="p-3 bg-zinc-700 rounded text-sm">
                    <div className="text-zinc-300">
                      <strong>{game.name || 'Unnamed Game'}</strong> - {game.status || 'No status'}
                    </div>
                    <div className="text-zinc-500 text-xs">ID: {game.id}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
