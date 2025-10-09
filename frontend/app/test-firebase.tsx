'use client'

import { useEffect, useState } from 'react'
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyCWNRGruxO1VbEQybetPXcLicwlixlrdVU",
  authDomain: "razzwars-319e6.firebaseapp.com",
  projectId: "razzwars-319e6",
  storageBucket: "razzwars-319e6.firebasestorage.app",
  messagingSenderId: "211646977519",
  appId: "1:211646977519:web:3589f1d44eb511c032121a",
  measurementId: "G-LZVQCLHGPC"
}

export default function FirebaseTest() {
  const [status, setStatus] = useState('Testing Firebase connection...')
  const [games, setGames] = useState<any[]>([])

  useEffect(() => {
    const testFirebase = async () => {
      try {
        // Initialize Firebase
        const app = initializeApp(firebaseConfig)
        const db = getFirestore(app)
        
        setStatus('Firebase initialized successfully!')
        
        // Test Firestore connection
        try {
          const gamesRef = collection(db, 'games')
          const snapshot = await getDocs(gamesRef)
          setGames(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
          setStatus(`Firestore connected! Found ${snapshot.docs.length} games.`)
        } catch (error) {
          setStatus(`Firestore error: ${error}`)
        }
        
      } catch (error) {
        setStatus(`Firebase error: ${error}`)
      }
    }
    
    testFirebase()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-zinc-900/60 backdrop-blur-sm rounded-2xl border border-zinc-800 p-8">
        <h1 className="text-2xl font-bold text-zinc-100 mb-4">Firebase Test</h1>
        <div className="mb-4">
          <p className="text-zinc-300">{status}</p>
        </div>
        {games.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-zinc-100 mb-2">Games:</h2>
            <div className="space-y-2">
              {games.map(game => (
                <div key={game.id} className="p-2 bg-zinc-800 rounded text-sm text-zinc-300">
                  {game.name || 'Unnamed Game'} - {game.status || 'No status'}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
