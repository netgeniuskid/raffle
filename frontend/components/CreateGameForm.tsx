'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { CreateGameRequest } from '@/lib/api'

interface CreateGameFormProps {
  onSubmit: (data: CreateGameRequest) => void
  onClose: () => void
  loading: boolean
}

export function CreateGameForm({ onSubmit, onClose, loading }: CreateGameFormProps) {
  const [formData, setFormData] = useState<CreateGameRequest>({
    name: '',
    totalCards: 50,
    prizeCount: 1,
    prizeNames: ['Prize'],
    playerSlots: 6,
    rows: 5,
    cols: 10,
    seed: undefined,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }))
  }

  const handlePrizeNameChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      prizeNames: prev.prizeNames?.map((name, i) => i === index ? value : name) || []
    }))
  }

  const addPrizeName = () => {
    setFormData(prev => ({
      ...prev,
      prizeNames: [...(prev.prizeNames || []), `Prize ${(prev.prizeNames?.length || 0) + 1}`]
    }))
  }

  const removePrizeName = (index: number) => {
    setFormData(prev => ({
      ...prev,
      prizeNames: prev.prizeNames?.filter((_, i) => i !== index) || []
    }))
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_20px_60px_-25px_rgba(0,0,0,0.5)] max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <h2 className="text-xl font-semibold text-zinc-100">Create New Game</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-zinc-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              Game Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              placeholder="Enter game name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">
                Total Cards
              </label>
              <input
                type="number"
                name="totalCards"
                value={formData.totalCards}
                onChange={handleChange}
                min="10"
                max="100"
                required
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">
                Prize Count
              </label>
              <input
                type="number"
                name="prizeCount"
                value={formData.prizeCount}
                onChange={handleChange}
                min="1"
                max={formData.totalCards - 1}
                required
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Prize Names
            </label>
            <div className="space-y-2">
              {formData.prizeNames?.map((prizeName, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={prizeName}
                    onChange={(e) => handlePrizeNameChange(index, e.target.value)}
                    placeholder={`Prize ${index + 1}`}
                    className="flex-1 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                  {formData.prizeNames && formData.prizeNames.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePrizeName(index)}
                      className="px-3 py-2 text-red-400 hover:text-red-300 transition-colors"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addPrizeName}
                className="w-full px-3 py-2 text-sm rounded border border-zinc-700 bg-zinc-800/60 text-zinc-300 hover:bg-zinc-800 transition-colors"
              >
                + Add Prize
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              Player Slots
            </label>
            <input
              type="number"
              name="playerSlots"
              value={formData.playerSlots}
              onChange={handleChange}
              min="2"
              max="20"
              required
              className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">
                Rows (Optional)
              </label>
              <input
                type="number"
                name="rows"
                value={formData.rows}
                onChange={handleChange}
                min="1"
                max="20"
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">
                Columns (Optional)
              </label>
              <input
                type="number"
                name="cols"
                value={formData.cols}
                onChange={handleChange}
                min="1"
                max="20"
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              Seed (Optional)
            </label>
            <input
              type="text"
              name="seed"
              value={(formData.seed as any) || ''}
              onChange={handleChange}
              placeholder="Use same seed to repeat layout"
              className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-zinc-300 border border-zinc-800 bg-zinc-900/60 rounded-lg hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-[0_0_0_1px_rgba(99,102,241,0.35)]"
            >
              {loading ? 'Creating...' : 'Create Game'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}