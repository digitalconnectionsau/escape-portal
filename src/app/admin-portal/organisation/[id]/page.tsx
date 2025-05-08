// OrganisationDetailPage with editable team members and delete buttons

'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import {
  doc, getDoc, collection, getDocs, addDoc, Timestamp, query, where, deleteDoc, updateDoc
} from 'firebase/firestore'
import { db } from '@/firebase'
import AddResults from "components/modals/AddResults"

interface Session {
  id: string
  date: string
  startTime: string
  teamName: string
  facilitatorName: string
  teamMembersCount: number
  teamId?: string
  roundId: string
  results?: {
    durationMinutes: number
    durationSeconds: number
    engagementRating: number
    participationRating: number
    submittedAt: any
  }
}


interface Round {
  id: string
  name: string
  startDate: string
  endDate: string
  gameId?: string
}

interface Organisation {
  id: string
  organisationName: string
  rounds: Round[]
}

interface Game {
  id: string
  name: string
}

interface TeamMemberInput {
  id?: string
  firstName: string
  lastName?: string
  email: string
  mobile?: string
  roundId?: string
}

interface Quiz {
  id: string
  title: string
  type: 'Pre' | 'Post'
}

export default function OrganisationDetailPage() {
  const { id } = useParams()
  const [organisation, setOrganisation] = useState<Organisation | null>(null)
  const [loading, setLoading] = useState(true)
  const [games, setGames] = useState<Game[]>([])
  const [sessions, setSessions] = useState<Session[]>([])

  const [showModal, setShowModal] = useState(false)
  const [modalRound, setModalRound] = useState<Round | null>(null)
  const [sessionDate, setSessionDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [facilitatorName, setFacilitatorName] = useState('')
  const [teamName, setTeamName] = useState('')
  const [teamMembers, setTeamMembers] = useState<TeamMemberInput[]>([{ firstName: '', email: '' }])
  const [editingSession, setEditingSession] = useState<Session | null>(null)
  const [deletedMemberIds, setDeletedMemberIds] = useState<string[]>([])
  const [preQuizzes, setPreQuizzes] = useState<Quiz[]>([])
const [postQuizzes, setPostQuizzes] = useState<Quiz[]>([])
const [selectedPreQuiz, setSelectedPreQuiz] = useState('')
const [selectedPostQuiz, setSelectedPostQuiz] = useState('')


  const fetchData = async () => {
    const orgRef = doc(db, 'Organisations', String(id))
    const orgSnap = await getDoc(orgRef)
    const gamesSnap = await getDocs(collection(db, 'Games'))
    setGames(gamesSnap.docs.map(doc => ({ id: doc.id, name: doc.data().name })))

    if (orgSnap.exists()) {
      const orgData = orgSnap.data()
      const roundsCol = collection(orgRef, 'Rounds')
      const roundsSnap = await getDocs(roundsCol)

      const rounds: Round[] = roundsSnap.docs.map(doc => {
        const data = doc.data()
        const start = data.startDate instanceof Timestamp ? data.startDate.toDate() : new Date()
        const end = data.endDate instanceof Timestamp ? data.endDate.toDate() : new Date()
        return {
          id: doc.id,
          name: data.roundName,
          startDate: start.toISOString().split('T')[0],
          endDate: end.toISOString().split('T')[0],
          gameId: data.gameId || ''
        }
      })

      setOrganisation({ id: orgSnap.id, organisationName: orgData.organisationName, rounds })
    }

    const sessionSnap = await getDocs(collection(db, 'Sessions'))
    const sessionData: Session[] = await Promise.all(sessionSnap.docs.map(async docSnap => {
      const data = docSnap.data()
      let teamMembersCount = 0
      if (data.teamId) {
        const membersSnap = await getDocs(query(collection(db, 'TeamMembers'), where('teamId', '==', data.teamId)))
        teamMembersCount = membersSnap.size
      }
      return {
        id: docSnap.id,
        date: data.date,
        startTime: data.startTime,
        teamName: data.teamName || '',
        facilitatorName: data.facilitatorName,
        teamMembersCount,
        teamId: data.teamId,
        roundId: data.roundId || '',
        results: data.results || undefined
      }
    }))
    setSessions(sessionData)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [id])

  const handleTeamMemberChange = (index: number, field: keyof TeamMemberInput, value: string) => {
    const updated = [...teamMembers]
    updated[index][field] = value
    setTeamMembers(updated)
  }

  const handleAddTeamMember = () => {
    if (teamMembers.length < 18) {
      setTeamMembers([...teamMembers, { firstName: '', email: '' }])
    }
  }

  const handleRemoveTeamMember = (index: number) => {
    const removed = teamMembers[index]
    if (removed.id) setDeletedMemberIds(prev => [...prev, removed.id!])
    if (teamMembers.length > 1) {
      setTeamMembers(teamMembers.filter((_, i) => i !== index))
    }
  }

  const openSessionModal = (round: Round) => {
    setEditingSession(null)
    setModalRound(round)
    setShowModal(true)
    setSessionDate('')
    setStartTime('')
    setFacilitatorName('')
    setTeamName('')
    setTeamMembers([{ firstName: '', email: '' }])
    setDeletedMemberIds([])
    

    
  }

  const openEditSessionModal = async (session: Session) => {
    setEditingSession(session)
    setModalRound(organisation?.rounds.find(r => r.id === session.roundId) || null)
    setSessionDate(session.date)
    setStartTime(session.startTime)
    setFacilitatorName(session.facilitatorName)
    setTeamName(session.teamName)
    setDeletedMemberIds([])

    const membersSnap = await getDocs(query(collection(db, 'TeamMembers'), where('teamId', '==', session.teamId)))
    const members = membersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as TeamMemberInput))
    setTeamMembers(members)
    setShowModal(true)
  }

  const handleSaveSession = async () => {
    if (!sessionDate || !startTime || !teamName || !facilitatorName || !modalRound) return

    if (editingSession) {
      const sessionRef = doc(db, 'Sessions', editingSession.id)
      const teamRef = doc(db, 'Teams', editingSession.teamId!)

      await updateDoc(sessionRef, {
        date: sessionDate,
        startTime,
        facilitatorName,
        teamName,
        roundId: modalRound.id
      })

      await updateDoc(teamRef, {
        teamName,
        roundId: modalRound.id
      })

      for (const id of deletedMemberIds) {
        await deleteDoc(doc(db, 'TeamMembers', id))
      }

      const validNew = teamMembers.filter(m => m.firstName && m.email && !m.id)
      await Promise.all(validNew.map(m => addDoc(collection(db, 'TeamMembers'), {
        ...m,
        teamId: editingSession.teamId,
        orgId: id,
        roundId: modalRound.id,
        sessionDate,
        joinedAt: new Date()
      })))
    }

    setShowModal(false)
    await fetchData()
  }
  const [showResultsModal, setShowResultsModal] = useState(false)
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
  
  const categorizeRounds = (rounds: Round[]) => {
    const today = new Date()
    const active = [] as Round[]
    const upcoming = [] as Round[]
    const past = [] as Round[]

    rounds.forEach(round => {
      const start = new Date(round.startDate)
      const end = new Date(round.endDate)
      if (start <= today && end >= today) active.push(round)
      else if (start > today) upcoming.push(round)
      else past.push(round)
    })

    return { active, upcoming, past }
  }

  if (loading || !organisation) return <div>Loading...</div>

  const { active, upcoming, past } = categorizeRounds(organisation.rounds)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{organisation.organisationName}</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={() => alert('Add round modal coming soon')}>➕ Add Round</button>
      </div>

      {([['🔥 Active Round', active], ['📅 Upcoming Rounds', upcoming], ['📜 Past Rounds', past]] as [string, Round[]][]).map(([label, group]) => (
        <div key={label}>
          <h2 className="text-xl font-semibold mt-6">{label}</h2>
          {group.map(round => (
            <div key={round.id} className="bg-white shadow p-4 rounded mt-2">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{round.name} ({round.startDate} – {round.endDate})</h3>
                  <p className="text-sm text-gray-600">Game: {games.find(g => g.id === round.gameId)?.name || 'None assigned'}</p>
                </div>
                <div className="space-x-2">
                  {(label !== '📜 Past Rounds') && <button onClick={() => openSessionModal(round)} className="bg-blue-600 text-white px-2 py-1 rounded">➕ Add Session</button>}
                  <button onClick={() => alert('Edit round')} className="text-blue-600">✏️ Edit</button>
                  <a
  href={`/scoreboard/${round.id}`}
  target="_blank"
  rel="noopener noreferrer"
  className="text-purple-600 hover:underline"
>
  🏆 Leaderboard
</a>


                </div>
              </div>
              <ul className="mt-3 space-y-1">
                {sessions.filter(s => s.roundId === round.id).map(session => (
                  <li key={session.id} className="border p-2 rounded flex justify-between items-center">
                    <div>
                    <strong>{session.date}</strong> at {session.startTime} — {session.teamName} (Facilitator: {session.facilitatorName})<br />
  <span className="text-xs text-gray-500">Members: {session.teamMembersCount}</span>
  {session.results && (
  <>
    <br />
    <span className="text-xs text-green-600">
      🕒 Duration: {session.results.durationMinutes}m {session.results.durationSeconds}s
    </span><br />
    <span className="text-xs text-blue-600">
      🌟 Engagement: {session.results.engagementRating}/10 · Participation: {session.results.participationRating}/10
    </span><br />
    <span className="text-xs text-purple-600 font-semibold">
      🏅 Score: {
        (() => {
          const minutes = session.results.durationMinutes
          const seconds = session.results.durationSeconds
          const totalSeconds = minutes * 60 + seconds
          const rawTimeScore = Math.max(0, 600 - (totalSeconds / 1800) * 600)
          const timeScore = rawTimeScore * 0.1
          const engagementScore = (session.results.engagementRating / 10) * 20
          const participationScore = (session.results.participationRating / 10) * 20
          const total = parseFloat((timeScore + engagementScore + participationScore).toFixed(1))
          return total
        })()
      }
    </span>
  </>
)}

  
                    </div>
                    <div className="flex gap-2">
  <button className="text-sm text-blue-600 hover:underline" onClick={() => openEditSessionModal(session)}>✏️ Edit</button>
  <button
    className="text-sm text-green-600 hover:underline"
    onClick={() => {
      setSelectedSessionId(session.id)
      setShowResultsModal(true)
    }}
  >
    📊 Results
  </button>
</div>


                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ))}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">{editingSession ? 'Edit' : 'Create'} Session</h2>
            <input className="border p-2 w-full mb-3" type="date" value={sessionDate} onChange={(e) => setSessionDate(e.target.value)} />
            <input className="border p-2 w-full mb-3" placeholder="Start Time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            <input className="border p-2 w-full mb-3" placeholder="Facilitator Name" value={facilitatorName} onChange={(e) => setFacilitatorName(e.target.value)} />
            <input className="border p-2 w-full mb-3" placeholder="Team Name" value={teamName} onChange={(e) => setTeamName(e.target.value)} />
            <h3 className="font-semibold mb-2">Team Members ({teamMembers.length}/18)</h3>
            {teamMembers.map((tm, i) => (
              <div key={i} className="grid grid-cols-4 gap-2 mb-2 items-center">
                <input className="border p-2" placeholder="First Name*" value={tm.firstName} onChange={(e) => handleTeamMemberChange(i, 'firstName', e.target.value)} />
                <input className="border p-2" placeholder="Last Name" value={tm.lastName || ''} onChange={(e) => handleTeamMemberChange(i, 'lastName', e.target.value)} />
                <input className="border p-2" placeholder="Email*" value={tm.email} onChange={(e) => handleTeamMemberChange(i, 'email', e.target.value)} />
                <div className="flex items-center">
                  <input className="border p-2 w-full" placeholder="Mobile" value={tm.mobile || ''} onChange={(e) => handleTeamMemberChange(i, 'mobile', e.target.value)} />
                  {teamMembers.length > 1 && (
                    <button onClick={() => handleRemoveTeamMember(i)} className="ml-2 text-red-500 text-sm">🗑️</button>
                  )}
                </div>
              </div>
            ))}
            {teamMembers.length < 18 && (
              <button onClick={handleAddTeamMember} className="text-blue-600 text-sm mb-4">➕ Add Member</button>
            )}
            <div className="flex justify-end gap-2">
              <button className="px-4 py-2 bg-gray-400 rounded" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="px-4 py-2 bg-green-600 text-white rounded" onClick={handleSaveSession}>{editingSession ? 'Update' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
      {showResultsModal && selectedSessionId && (
  <AddResults
    sessionId={selectedSessionId}
    onClose={() => {
      setShowResultsModal(false)
      setSelectedSessionId(null)
    }}
    onSaved={fetchData}
  />
)}

    </div>
  )
}
