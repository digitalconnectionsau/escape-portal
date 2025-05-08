'use client'

import { useState } from 'react'
import { addDoc, collection } from 'firebase/firestore'
import { db } from '@/firebase'

export default function AddSessionModal({
  organisationId,
  roundId,
  onClose,
  onCreated,
}: {
  organisationId: string
  roundId: string
  onClose: () => void
  onCreated: () => void
}) {
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [teamName, setTeamName] = useState('')
  const [teamMembersCount, setTeamMembersCount] = useState(0)
  const [facilitatorName, setFacilitatorName] = useState('')

  const handleSubmit = async () => {
    if (!date || !startTime || !teamName) {
      alert('Please fill in date, time, and team name.')
      return
    }
  
    try {
      const sessionRef = collection(
        db,
        'Organisations',
        organisationId,
        'Rounds',
        roundId,
        'Sessions'
      )
  
      await addDoc(sessionRef, {
        date: new Date(date), // convert input type="date" string to JS Date
        startTime,
        teamName,
        teamMembersCount,
        facilitatorName,
      })
  
      onCreated()
    } catch (err) {
      console.error('🔥 Failed to save session:', err)
      alert('Failed to save session.')
    }
  }
  

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Add Session</h2>
        <input
          className="w-full p-2 mb-2 border rounded"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <input
          className="w-full p-2 mb-2 border rounded"
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />
        <input
          className="w-full p-2 mb-2 border rounded"
          placeholder="Team Name"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
        />
        <input
          className="w-full p-2 mb-2 border rounded"
          type="number"
          placeholder="Number of Team Members"
          value={teamMembersCount}
          onChange={(e) => setTeamMembersCount(Number(e.target.value))}
        />
        <input
          className="w-full p-2 mb-4 border rounded"
          placeholder="Facilitator Name"
          value={facilitatorName}
          onChange={(e) => setFacilitatorName(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 bg-gray-300 rounded" onClick={onClose}>
            Cancel
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={handleSubmit}>
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
