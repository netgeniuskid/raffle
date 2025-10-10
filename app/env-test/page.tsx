'use client'

import { useEffect, useState } from 'react'

export default function EnvTest() {
  const [envVars, setEnvVars] = useState<any>({})

  useEffect(() => {
    const vars = {
      NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV
    }
    
    setEnvVars(vars)
    console.log('Environment Variables:', vars)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-zinc-100 mb-6">Environment Variables Test</h1>
        
        <div className="bg-zinc-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-zinc-100 mb-4">Current Environment Variables</h2>
          <div className="space-y-2">
            {Object.entries(envVars).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center p-2 bg-zinc-700 rounded">
                <span className="text-zinc-300 font-mono text-sm">{key}:</span>
                <span className={`text-sm ${value ? 'text-green-400' : 'text-red-400'}`}>
                  {value ? (key.includes('KEY') ? '***HIDDEN***' : String(value)) : 'NOT SET'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
