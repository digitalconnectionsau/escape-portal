'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { auth, db } from '@/firebase';
import { useAuth } from '@/context/AuthProvider';

interface Organisation {
  id: string;
  organisationName: string;
  organisationAdminId: string;
  status: string;
  timezone: string;
  primaryContact: {
    uid: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function OrganisationsPage() {
  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { role } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        console.warn('No authenticated user. Aborting fetch.');
        setError('User not authenticated.');
        setLoading(false);
        return;
      }

      const idTokenResult = await currentUser.getIdTokenResult(true); // Force refresh token
      console.log('[DEBUG] Token Claims on Org Page:', idTokenResult.claims);

      if (idTokenResult.claims.role !== 'super-admin') {
        console.warn('User is not super-admin. Aborting organisation fetch.');
        setError('You do not have permission to view organisations.');
        setLoading(false);
        return;
      }

      try {
        const snapshot = await getDocs(collection(db, 'Organisations'));
        const orgData: Organisation[] = snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as Organisation[];

        setOrganisations(orgData);
      } catch (err: any) {
        console.error('❌ Firestore Error:', err);
        setError('Failed to fetch organisations.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p className="text-gray-400 text-center mt-10">Loading Organisations...</p>;
  if (error) return <p className="text-red-600 text-center mt-10">{error}</p>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">All Organisations</h2>
      <div className="space-y-2">
        {organisations.length === 0 ? (
          <p className="text-gray-500">No organisations found.</p>
        ) : (
          organisations.map(org => (
            <div
              key={org.id}
              className="border p-4 rounded bg-gray-50 text-sm text-gray-700 shadow-sm"
            >
              <div className="font-semibold">🏢 {org.organisationName}</div>
              <div>👤 Admin: {org.primaryContact?.firstName} {org.primaryContact?.lastName}</div>
              <div>📧 Contact Email: {org.primaryContact?.email}</div>
              <div>🌏 Timezone: {org.timezone}</div>
              <div>📌 Status: {org.status}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
