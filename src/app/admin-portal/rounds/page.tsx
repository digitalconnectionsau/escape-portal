// RoundsPage.tsx 
'use client'

import { useEffect, useState } from 'react'
import { collection, collectionGroup, getDocs } from 'firebase/firestore'
import { db } from '@/firebase'

interface Round {
  id: string
  name: string
  startDate: string
  endDate: string
  orgId: string
  organisationName: string
}

interface Session {
  id: string
  date: string
  startTime: string
  facilitatorName: string
  roundId: string
  teamName: string
  teamId: string
}

export default function RoundsPage() {
  const [rounds, setRounds] = useState<Round[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRoundsAndSessions = async () => {
      // Step 1: Load all organisations into a map
      const orgSnap = await getDocs(collection(db, 'Organisations'))
      const orgMap: Record<string, string> = {}
      orgSnap.forEach(doc => {
        orgMap[doc.id] = doc.data().organisationName || 'Unknown Org'
      })

      // Step 2: Load rounds and inject org name
      const roundSnapshots = await getDocs(collectionGroup(db, 'Rounds'))
      const fetchedRounds: Round[] = []

      roundSnapshots.forEach(docSnap => {
        const data = docSnap.data()
        const parent = docSnap.ref.parent.parent
        if (!parent) return

        fetchedRounds.push({
          id: docSnap.id,
          name: data.roundName,
          startDate: data.startDate.toDate().toISOString().split('T')[0],
          endDate: data.endDate.toDate().toISOString().split('T')[0],
          orgId: parent.id,
          organisationName: orgMap[parent.id] || 'Unknown Org',
        })
      })

      // Step 3: Load sessions
      const sessionsSnap = await getDocs(collectionGroup(db, 'Sessions'))
      const fetchedSessions: Session[] = sessionsSnap.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          date: data.date,
          startTime: data.startTime,
          facilitatorName: data.facilitatorName,
          roundId: data.roundId,
          teamName: data.teamName || '',
          teamId: data.teamId || '',
        }
      })

      setRounds(fetchedRounds)
      setSessions(fetchedSessions)
      setLoading(false)
    }

    fetchRoundsAndSessions()
  }, [])

  const today = new Date()
  const activeRounds = rounds.filter(r => new Date(r.startDate) <= today && new Date(r.endDate) >= today)

  const getSessionsForRound = (roundId: string) => sessions.filter(s => s.roundId === roundId)

  const handleEdit = (session: Session) => {
    alert(`Edit session for team: ${session.teamName}`)
    // TODO: replace with modal in future
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Active Rounds</h1>
      {activeRounds.map(round => (
        <div key={round.id} className="bg-white shadow rounded p-4 mb-4">
          <h2 className="text-xl font-semibold mb-2">{round.name} ({round.startDate} – {round.endDate})</h2>
          <p className="text-sm text-gray-500 mb-2">Organisation: {round.organisationName}</p>
          <ul className="space-y-2">
            {getSessionsForRound(round.id).map(session => (
              <li key={session.id} className="border p-2 rounded flex justify-between items-center">
                <div>
                  <strong>{session.date}</strong> at {session.startTime} — {session.teamName} (Facilitator: {session.facilitatorName})
                </div>
                <button
                  onClick={() => handleEdit(session)}
                  className="text-blue-600 hover:underline text-sm ml-4"
                >
                  ✏️ Edit
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}        
