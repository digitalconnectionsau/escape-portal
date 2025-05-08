'use client'

import { useState } from 'react'
import { collection, addDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/firebase'

interface Props {
  organisationId: string
  onClose: () => void
  onCreated?: () => void
}

export default function AddRoundModal({ organisationId, onClose, onCreated }: Props) {
  const [roundName, setRoundName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    try {
      if (!startDate || !endDate) {
        setError('Start and end dates are required.')
        return
      }

      const start = Timestamp.fromDate(new Date(startDate))
      const end = Timestamp.fromDate(new Date(endDate))

      const roundDoc = {
        organisationId,
        roundName: roundName || `${startDate} Round`,
        startDate: start,
        endDate: end,
        status: 'active'
      }

      await addDoc(collection(db, 'Rounds'), roundDoc)

      onCreated?.()
      onClose()
    } catch (err) {
      console.error(err)
      setError('Failed to create round.')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">Add New Round</h2>

        <div className="mb-3">
          <label className="block text-sm font-medium">Round Name (optional)</label>
          <input type="text" className="w-full p-2 border rounded" value={roundName} onChange={e => setRoundName(e.target.value)} />
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium">Start Date</label>
          <input type="date" className="w-full p-2 border rounded" value={startDate} onChange={e => setStartDate(e.target.value)} />
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium">End Date</label>
          <input type="date" className="w-full p-2 border rounded" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </div>

        {error && <div className="text-red-600 text-sm mb-3">{error}</div>}

        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 bg-gray-200 rounded" onClick={onClose}>Cancel</button>
          <button className="px-4 py-2 bg-orange-500 text-white font-bold rounded" onClick={handleSubmit}>Save</button>
        </div>
      </div>
    </div>
  )
}
