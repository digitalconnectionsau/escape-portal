// SessionsPage.tsx — fix orgId lookup and member count query

'use client'

import { useEffect, useState } from 'react'
import { collection, collectionGroup, getDocs, doc, getDoc, query, where } from 'firebase/firestore'
import { db } from '@/firebase'

interface Session {
  id: string
  date: string
  startTime: string
  facilitatorName: string
  teamName: string
  teamId: string
  roundId: string
  orgId: string
  organisationName: string
  memberCount: number
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSessions = async () => {
      const orgSnap = await getDocs(collection(db, 'Organisations'))
      const orgMap: Record<string, string> = {}
      orgSnap.forEach(doc => {
        orgMap[doc.id] = doc.data().organisationName || 'Unknown Org'
      })

      const sessionSnap = await getDocs(collectionGroup(db, 'Sessions'))
      const sessionList: Session[] = await Promise.all(
        sessionSnap.docs.map(async docSnap => {
          const data = docSnap.data()
          const teamId = data.teamId || ''

          // Get orgId from Firestore path
          const orgRef = docSnap.ref.parent.parent?.parent
          const orgId = orgRef?.id || ''

          // Count members by querying with where clause
          let memberCount = 0
          if (teamId) {
            const memberQuery = query(collection(db, 'TeamMembers'), where('teamId', '==', teamId))
            const membersSnap = await getDocs(memberQuery)
            memberCount = membersSnap.size
          }

          return {
            id: docSnap.id,
            date: data.date,
            startTime: data.startTime,
            facilitatorName: data.facilitatorName,
            teamName: data.teamName || '',
            teamId,
            roundId: data.roundId || '',
            orgId,
            organisationName: orgMap[orgId] || 'Unknown Org',
            memberCount,
          }
        })
      )

      setSessions(sessionList)
      setLoading(false)
    }

    fetchSessions()
  }, [])

  const today = new Date()
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay())

  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)

  const sessionsThisWeek = sessions.filter(s => {
    const d = new Date(s.date)
    return d >= startOfWeek && d <= endOfWeek
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const upcomingSessions = sessions.filter(s => {
    const d = new Date(s.date)
    return d > endOfWeek
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const pastSessions = sessions.filter(s => {
    const d = new Date(s.date)
    return d < startOfWeek
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const renderSessionCard = (session: Session) => (
    <li key={session.id} className="border p-3 rounded flex justify-between items-start">
      <div>
        <strong>{session.date}</strong> at {session.startTime}<br />
        <span className="text-sm text-gray-600">{session.teamName} | Facilitator: {session.facilitatorName}</span><br />
        <span className="text-xs text-gray-500">Org: {session.organisationName} | Members: {session.memberCount}</span>
      </div>
      <a
        href={`/admin-portal/organisation/${session.orgId}`}
        className="text-blue-600 hover:underline text-sm ml-4"
      >
        ✏️ Edit
      </a>
    </li>
  )

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Sessions</h1>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">🗓 This Week</h2>
        {sessionsThisWeek.length === 0 ? (
          <p className="text-sm text-gray-600">No sessions this week.</p>
        ) : (
          <ul className="space-y-2">
            {sessionsThisWeek.map(renderSessionCard)}
          </ul>
        )}
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">⏭ Upcoming</h2>
        {upcomingSessions.length === 0 ? (
          <p className="text-sm text-gray-600">No upcoming sessions.</p>
        ) : (
          <ul className="space-y-2">
            {upcomingSessions.map(renderSessionCard)}
          </ul>
        )}
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">📜 Past Sessions</h2>
        {pastSessions.length === 0 ? (
          <p className="text-sm text-gray-600">No past sessions.</p>
        ) : (
          <ul className="space-y-2">
            {pastSessions.map(renderSessionCard)}
          </ul>
        )}
      </section>
    </div>
  )
}        
