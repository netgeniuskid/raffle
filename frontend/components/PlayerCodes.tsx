'use client'

import { Copy, Check } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

interface PlayerCodesProps {
  codes: Array<{ username: string; code: string }>
}

export function PlayerCodes({ codes }: PlayerCodesProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const copyToClipboard = async (code: string, index: number) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedIndex(index)
      toast.success('Code copied to clipboard!')
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch (error) {
      toast.error('Failed to copy code')
    }
  }

  if (codes.length === 0) {
    return (
      <div className="text-center text-zinc-500 py-8">
        <div className="text-sm">No player codes generated yet</div>
        <div className="text-xs mt-1">Create a game to generate codes</div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {codes.map(({ username, code }, index) => (
        <div
          key={index}
          className="flex items-center justify-between p-3 rounded-lg border border-zinc-800 bg-zinc-900/60"
        >
          <div className="flex-1">
            <div className="font-medium text-zinc-100">{username}</div>
            <div className="text-sm font-mono text-zinc-400">{code}</div>
          </div>
          <button
            onClick={() => copyToClipboard(code, index)}
            className="ml-3 p-2 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            {copiedIndex === index ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
      ))}
    </div>
  )
}



