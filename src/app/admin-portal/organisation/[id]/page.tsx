// Organisation Details
// src/app/admin-portal/organstion/[id]/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { collection, doc, getDoc, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import AddResults from 'components/modals/AddResults';
import SessionModal from '@/components/modals/SessionModal';
import AddRoundModal from 'components/modals/AddRoundModal';
import RoundCard from 'components/RoundCards';
import { Organisation, Round, Session } from '@/types/interfaces';

export default function OrganisationDetailPage() {
  const { id } = useParams();
  const [organisation, setOrganisation] = useState<Organisation | null>(null);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAddSessionModal, setShowAddSessionModal] = useState(false);
  const [sessionToEdit, setSessionToEdit] = useState<Session | null>(null);
  const [modalRound, setModalRound] = useState<Round | null>(null);

  const [showAddRoundModal, setShowAddRoundModal] = useState(false);
  const [roundToEdit, setRoundToEdit] = useState<Round | null>(null);

  const [showResultsModal, setShowResultsModal] = useState(false);
  const [resultsSessionId, setResultsSessionId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    if (!id) return;

    const orgRef = doc(db, 'Organisations', String(id));
    const orgSnap = await getDoc(orgRef);
    if (orgSnap.exists()) {
      const orgData = orgSnap.data();
      setOrganisation({ id: orgSnap.id, organisationName: orgData.organisationName });
    }

    const roundsQuery = query(collection(db, 'Rounds'), where('organisationId', '==', id));
    const roundsSnap = await getDocs(roundsQuery);
    const roundsList: Round[] = await Promise.all(
      roundsSnap.docs.map(async (docSnap) => {
        const data = docSnap.data();
        const start = data.startDate instanceof Timestamp ? data.startDate.toDate() : new Date();
        const end = data.endDate instanceof Timestamp ? data.endDate.toDate() : new Date();

        const gameDoc = data.gameId ? await getDoc(doc(db, 'Games', data.gameId)) : null;
        const preQuizDoc = data.preQuizId ? await getDoc(doc(db, 'Quizzes', data.preQuizId)) : null;
        const postQuizDoc = data.postQuizId ? await getDoc(doc(db, 'Quizzes', data.postQuizId)) : null;

        return {
          id: docSnap.id,
          name: data.roundName,
          startDate: start.toISOString().split('T')[0],
          endDate: end.toISOString().split('T')[0],
          gameId: data.gameId || '',
          preQuizId: data.preQuizId || '',
          postQuizId: data.postQuizId || '',
          gameName: gameDoc?.data()?.name || 'N/A',
          preQuizTitle: preQuizDoc?.data()?.title || 'N/A',
          postQuizTitle: postQuizDoc?.data()?.title || 'N/A',
        };
      })
    );

    setRounds(roundsList);

    const sessionQuery = query(collection(db, 'Sessions'), where('orgId', '==', id));
    const sessionSnap = await getDocs(sessionQuery);
    const sessionList: Session[] = sessionSnap.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        date: data.date,
        startTime: data.startTime,
        teamName: data.teamName || '',
        facilitatorName: data.facilitatorName,
        teamMembersCount: data.teamMembersCount || 0,
        teamId: data.teamId,
        roundId: data.roundId || '',
        results: data.results || undefined,
      };
    });
    setSessions(sessionList);

    setLoading(false);
  };

  const categorizeRounds = () => {
    const today = new Date();
    const active: Round[] = [];
    const upcoming: Round[] = [];
    const past: Round[] = [];

    rounds.forEach((round) => {
      const start = new Date(round.startDate);
      const end = new Date(round.endDate);
      if (start <= today && end >= today) active.push(round);
      else if (start > today) upcoming.push(round);
      else past.push(round);
    });

    return { active, upcoming, past };
  };

  const { active, upcoming, past } = categorizeRounds();

  const openSessionModal = (round: Round) => {
    setModalRound(round);
    setSessionToEdit(null);
    setShowAddSessionModal(true);
  };

  const openEditSessionModal = (session: Session) => {
    setModalRound(rounds.find((r) => r.id === session.roundId) || null);
    setSessionToEdit(session);
    setShowAddSessionModal(true);
  };

  const openEditRoundModal = (round: Round) => {
    setRoundToEdit(round);
    setShowAddRoundModal(true);
  };

  const openResultsModal = (sessionId: string) => {
    setResultsSessionId(sessionId);
    setShowResultsModal(true);
  };

  if (loading || !organisation) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{organisation.organisationName}</h1>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={() => {
            setRoundToEdit(null);
            setShowAddRoundModal(true);
          }}
        >
          ➕ Add Round
        </button>
      </div>

      {([
        ['🔥 Active Round', active],
        ['📅 Upcoming Rounds', upcoming],
        ['📜 Past Rounds', past],
      ] as [string, Round[]][]).map(([label, group]) => (
        <div key={label}>
          <h2 className="text-xl font-semibold mt-6">{label}</h2>
          {group.map((round) => (
            <RoundCard
              key={round.id}
              label={label}
              round={round}
              sessions={sessions}
              openSessionModal={() => openSessionModal(round)}
              openEditSessionModal={openEditSessionModal}
              handleEditRound={() => openEditRoundModal(round)}
              handleShowResults={openResultsModal} // ✅ This links the 📊 icon to openResultsModal
            />
          ))}
        </div>
      ))}

      {showAddRoundModal && (
        <AddRoundModal
          organisationId={organisation.id}
          roundToEdit={roundToEdit || undefined}
          onClose={() => {
            setShowAddRoundModal(false);
            setRoundToEdit(null);
          }}
          onCompleted={() => {
            setShowAddRoundModal(false);
            setRoundToEdit(null);
            fetchData();
          }}
        />
      )}

      {showAddSessionModal && (
        <SessionModal
          organisationId={organisation.id}
          roundId={modalRound?.id || ''}
          sessionToEdit={sessionToEdit || undefined}
          onClose={() => {
            setShowAddSessionModal(false);
            setSessionToEdit(null);
          }}
          onCompleted={() => {
            setShowAddSessionModal(false);
            setSessionToEdit(null);
            fetchData();
          }}
        />
      )}

      {showResultsModal && resultsSessionId && (
        <AddResults
          sessionId={resultsSessionId}
          onClose={() => {
            setShowResultsModal(false);
            setResultsSessionId(null);
          }}
          onSaved={() => {
            setShowResultsModal(false);
            setResultsSessionId(null);
            fetchData();
          }}
        />
      )}
    </div>
  );
}
