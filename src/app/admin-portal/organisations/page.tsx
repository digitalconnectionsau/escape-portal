'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, Timestamp } from 'firebase/firestore';
import { auth, db } from '@/firebase';
import Link from 'next/link';
import NewOrganisationModal from '@/components/modals/AddOrganisationModal';
import RequireRole from '@/components/Auth/RequireRole';



interface Organisation {
  id: string;
  organisationName: string;
  organisationAdminId: string;
  status: string;
}

interface Round {
  id: string;
  roundName: string;
  startDate: Timestamp;
  endDate: Timestamp;
  orgId: string;
}

interface Session {
  id: string;
  orgId: string;
  roundId: string;
  date: string;
}

interface User {
  id: string;
  firstName: string;
  email: string;
}

export default function OrganisationsPage() {
  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string>('');

  const fetchData = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setError('User not authenticated.');
        return;
      }

      const idTokenResult = await currentUser.getIdTokenResult(true);
      if (idTokenResult.claims.role !== 'super-admin') {
        setError('You do not have permission to view organisations.');
        return;
      }

      const orgsSnapshot = await getDocs(collection(db, 'Organisations'));
      const orgsList = orgsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<Organisation, 'id'>),
      }));
      setOrganisations(orgsList);

      const allRounds: Round[] = [];
      for (const org of orgsList) {
        const roundSnap = await getDocs(collection(db, 'Rounds'));
        const orgRounds = roundSnap.docs.map(doc => ({
          id: doc.id,
          orgId: org.id,
          ...doc.data(),
        })) as Round[];
        allRounds.push(...orgRounds);
      }
      setRounds(allRounds);

      const sessionsSnap = await getDocs(collection(db, 'Sessions'));
      const sess = sessionsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Session));
      setSessions(sess);

      const usersSnap = await getDocs(collection(db, 'Users'));
      const usrs = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
      setUsers(usrs);

    } catch (err) {
      console.error('Error fetching organisations:', err);
      setError('Failed to fetch organisations.');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getPrimaryContact = (adminId: string) => {
    const user = users.find(u => u.id === adminId);
    return user ? user.firstName : '—';
  };

  const getCurrentRoundShort = (orgId: string) => {
    const today = new Date();
    const active = rounds.find(
      r => r.orgId === orgId && r.startDate.toDate() <= today && r.endDate.toDate() >= today
    );
    return active ? active.roundName.slice(0, 8) : '—';
  };

  const getUpcomingSessionsCount = (orgId: string) => {
    const today = new Date().toISOString();
    return sessions.filter(s => s.orgId === orgId && s.date >= today).length;
  };

  const getCompletedSessionsCount = (orgId: string) => {
    const today = new Date().toISOString();
    return sessions.filter(s => s.orgId === orgId && s.date < today).length;
  };

  if (error) {
    return <p className="text-red-600 text-center mt-10">{error}</p>;
  }

  return (
    <RequireRole allowedRoles={['super-admin']}>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-black">Organisations</h2>
          <button
            className="bg-orange-500 hover:bg-yellow-400 text-black font-bold px-4 py-2 rounded transition"
            onClick={() => setShowModal(true)}
          >
            ➕ New Organisation
          </button>
        </div>

        <div className="overflow-x-auto rounded-2xl shadow-lg">
          <table className="w-full bg-black text-white">
            <thead className="bg-gray-800">
              <tr>
                <th className="text-left px-6 py-3">Organisation Name</th>
                <th className="text-left px-6 py-3">Primary Contact</th>
                <th className="text-left px-6 py-3">Current Round</th>
                <th className="text-left px-6 py-3">Sessions Upcoming</th>
                <th className="text-left px-6 py-3">Sessions Completed</th>
                <th className="text-left px-6 py-3">Scoreboard</th>
                <th className="text-left px-6 py-3">Manage</th>
              </tr>
            </thead>
            <tbody>
              {organisations.length > 0 ? (
                organisations.map(org => (
                  <tr key={org.id} className="border-t border-gray-700">
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin-portal/organisation/${org.id}`}
                        className="text-orange-400 hover:text-yellow-400 underline"
                      >
                        {org.organisationName}
                      </Link>
                    </td>
                    <td className="px-6 py-4">{getPrimaryContact(org.organisationAdminId)}</td>
                    <td className="px-6 py-4">{getCurrentRoundShort(org.id)}</td>
                    <td className="px-6 py-4">{getUpcomingSessionsCount(org.id)}</td>
                    <td className="px-6 py-4">{getCompletedSessionsCount(org.id)}</td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/scoreboard/${org.id}`}
                        className="text-orange-400 hover:text-yellow-400 underline"
                      >
                        View
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin-portal/organisation/${org.id}`}
                        className="text-orange-400 hover:text-yellow-400 text-2xl"
                        title="Manage Organisation"
                      >
                        ⚙️
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center px-6 py-6 text-gray-400">
                    No organisations found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {showModal && (
          <NewOrganisationModal
            onClose={() => setShowModal(false)}
            onCreated={() => {
              setShowModal(false);
              fetchData();
            }}
          />
        )}
      </div>
    </RequireRole>
  );
}
