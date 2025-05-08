'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/firebase'

interface Session {
  id: string
  teamName: string
  facilitatorName: string
  durationMinutes: number
  durationSeconds: number
  engagementRating: number
  participationRating: number
  score: number
}

export default function ScoreboardPage() {
  const { roundId } = useParams()
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSessions = async () => {
      const q = query(collection(db, 'Sessions'), where('roundId', '==', String(roundId)))
      const snapshot = await getDocs(q)

      const data: Session[] = snapshot.docs
        .map(doc => {
          const d = doc.data()
          if (!d.results) return null

          const minutes = d.results.durationMinutes
          const seconds = d.results.durationSeconds
          const totalSeconds = minutes * 60 + seconds
          const rawTimeScore = Math.max(0, 600 - (totalSeconds / 1800) * 600)
          const timeScore = rawTimeScore * 0.1
          const engagementScore = (d.results.engagementRating / 10) * 20
          const participationScore = (d.results.participationRating / 10) * 20
          const total = parseFloat((timeScore + engagementScore + participationScore).toFixed(1))

          return {
            id: doc.id,
            teamName: d.teamName || 'Unnamed Team',
            facilitatorName: d.facilitatorName || 'Unknown',
            durationMinutes: minutes,
            durationSeconds: seconds,
            engagementRating: d.results.engagementRating,
            participationRating: d.results.participationRating,
            score: total,
          }
        })
        .filter(Boolean) as Session[]

      const sorted = data.sort((a, b) => b.score - a.score)
      setSessions(sorted)
      setLoading(false)
    }

    fetchSessions()
  }, [roundId])

  if (loading) return <div className="p-6 text-center text-xl">Loading leaderboard...</div>

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4 text-center">🏆 Scoreboard</h1>
      <ul className="space-y-3">
        {sessions.map((s, i) => {
          const badge = i === 0 ? '🥇 Gold' : i === 1 ? '🥈 Silver' : i === 2 ? '🥉 Bronze' : null
          const badgeClass = i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-amber-700' : 'text-gray-700'
          return (
            <li key={s.id} className={`border p-4 rounded shadow flex justify-between items-center ${badge ? 'bg-gray-50' : ''}`}>
              <div>
                <p className="font-semibold text-lg">{s.teamName}</p>
                <p className="text-sm text-gray-500">Facilitator: {s.facilitatorName}</p>
              </div>
              <div className="text-right">
                {badge && <p className={`font-bold ${badgeClass}`}>{badge}</p>}
                <p className="text-2xl font-bold">{s.score}</p>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
