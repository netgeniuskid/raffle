'use client'

import { useEffect, useState } from 'react'
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, getDocs, doc, setDoc } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
}

export default function FirebaseConnectionTest() {
  const [status, setStatus] = useState('Testing Firebase connection...')
  const [games, setGames] = useState<any[]>([])
  const [testResult, setTestResult] = useState<string>('')

  useEffect(() => {
    const testFirebase = async () => {
      try {
        // Initialize Firebase
        const app = initializeApp(firebaseConfig)
        const db = getFirestore(app)
        
        setStatus('Firebase initialized successfully!')
        
        // Test Firestore connection by reading games
        try {
          const gamesRef = collection(db, 'games')
          const snapshot = await getDocs(gamesRef)
          const gamesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
          setGames(gamesData)
          setStatus(`Firestore connected! Found ${snapshot.docs.length} games.`)
        } catch (error) {
          setStatus(`Firestore read error: ${error}`)
        }
        
        // Test writing to Firestore
        try {
          const testDocRef = await addDoc(collection(db, 'test'), {
            message: 'Hello from Vercel!',
            timestamp: new Date().toISOString(),
            testId: Math.random().toString(36).substr(2, 9)
          })
          setTestResult(`✅ Write test successful! Document ID: ${testDocRef.id}`)
        } catch (error) {
          setTestResult(`❌ Write test failed: ${error}`)
        }
        
      } catch (error) {
        setStatus(`Firebase initialization error: ${error}`)
      }
    }
    
    testFirebase()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-zinc-900/60 backdrop-blur-sm rounded-2xl border border-zinc-800 p-8">
        <h1 className="text-3xl font-bold text-zinc-100 mb-6 text-center">Firebase Connection Test</h1>
        
        <div className="space-y-6">
          {/* Status */}
          <div className="bg-zinc-800 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-zinc-100 mb-2">Connection Status:</h2>
            <p className="text-zinc-300">{status}</p>
          </div>

          {/* Test Result */}
          {testResult && (
            <div className="bg-zinc-800 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-zinc-100 mb-2">Write Test:</h2>
              <p className="text-zinc-300">{testResult}</p>
            </div>
          )}

          {/* Environment Variables */}
          <div className="bg-zinc-800 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-zinc-100 mb-2">Environment Variables:</h2>
            <div className="space-y-2 text-sm">
              <p className="text-zinc-400">API Key: {firebaseConfig.apiKey ? '✅ Set' : '❌ Missing'}</p>
              <p className="text-zinc-400">Project ID: {firebaseConfig.projectId ? '✅ Set' : '❌ Missing'}</p>
              <p className="text-zinc-400">Auth Domain: {firebaseConfig.authDomain ? '✅ Set' : '❌ Missing'}</p>
            </div>
          </div>

          {/* Games List */}
          {games.length > 0 && (
            <div className="bg-zinc-800 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-zinc-100 mb-2">Existing Games:</h2>
              <div className="space-y-2">
                {games.map(game => (
                  <div key={game.id} className="p-2 bg-zinc-700 rounded text-sm text-zinc-300">
                    <strong>{game.name || 'Unnamed Game'}</strong> - {game.status || 'No status'}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-blue-300 mb-2">Next Steps:</h2>
            <ul className="text-sm text-blue-200 space-y-1">
              <li>1. If you see errors, check Firestore security rules</li>
              <li>2. Go to Firebase Console → Firestore → Rules</li>
              <li>3. Set rules to allow read/write: if true</li>
              <li>4. Click "Publish"</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
