'use client'

import { useState } from 'react'
import { doc, updateDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/firebase'

interface AddResultsProps {
  sessionId: string
  onClose: () => void
  onSaved?: () => void
}

export default function AddResults({ sessionId, onClose, onSaved }: AddResultsProps) {
  const [minutes, setMinutes] = useState('')
  const [seconds, setSeconds] = useState('')
  const [engagement, setEngagement] = useState('')
  const [participation, setParticipation] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!minutes || !seconds || !engagement || !participation) return alert('All fields required')
    setSaving(true)
    try {
      const sessionRef = doc(db, 'Sessions', sessionId)
      await updateDoc(sessionRef, {
        results: {
          durationMinutes: Number(minutes),
          durationSeconds: Number(seconds),
          engagementRating: Number(engagement),
          participationRating: Number(participation),
          submittedAt: Timestamp.now()
        }
      })
      onClose()
      onSaved?.()
    } catch (err) {
      console.error('Error saving results:', err)
      alert('Failed to save results.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Session Results</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <input
            className="border p-2"
            placeholder="Minutes"
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            type="number"
          />
          <input
            className="border p-2"
            placeholder="Seconds"
            value={seconds}
            onChange={(e) => setSeconds(e.target.value)}
            type="number"
          />
        </div>
        <input
          className="border p-2 w-full mb-3"
          placeholder="1–5: Engagement rating"
          value={engagement}
          onChange={(e) => setEngagement(e.target.value)}
          type="number"
          min={1}
          max={5}
        />
        <input
          className="border p-2 w-full mb-4"
          placeholder="1–5: Participation rating"
          value={participation}
          onChange={(e) => setParticipation(e.target.value)}
          type="number"
          min={1}
          max={5}
        />
        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 bg-gray-400 rounded" onClick={() => { setMinutes(''); setSeconds(''); setEngagement(''); setParticipation(''); onClose(); }} disabled={saving}>Cancel</button>
          <button
            className="px-4 py-2 bg-green-600 text-white rounded"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
