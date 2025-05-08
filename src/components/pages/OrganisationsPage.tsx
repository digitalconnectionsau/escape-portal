//src/app/components/pages/OrganisationsPage.tsx
'use client'

import { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/firebase'
import Link from 'next/link'

interface Organisation {
  id: string
  organisationName: string
  organisationAdminId: string
  status: string
}

export default function OrganisationsPage() {
  const [organisations, setOrganisations] = useState<Organisation[]>([])

  useEffect(() => {
    const fetchOrganisations = async () => {
      try {
        const orgsSnapshot = await getDocs(collection(db, 'Organisations'))
        const orgsList = orgsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<Organisation, 'id'>),
        }))
        setOrganisations(orgsList)
      } catch (error) {
        console.error('Error fetching organisations:', error)
      }
    }

    fetchOrganisations()
  }, [])

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Organisations</h2>
        <button className="bg-orange-500 hover:bg-yellow-400 text-black font-bold px-4 py-2 rounded-full transition">
          ➕ New Organisation
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl shadow-lg">
        <table className="w-full bg-black text-white">
          <thead className="bg-gray-800">
            <tr>
              <th className="text-left px-6 py-3">Organisation Name</th>
              <th className="text-left px-6 py-3">Primary Contact</th>
              <th className="text-left px-6 py-3">Secondary Contacts</th>
              <th className="text-left px-6 py-3">Current Round</th>
              <th className="text-left px-6 py-3">Sessions Upcoming</th>
              <th className="text-left px-6 py-3">Sessions Completed</th>
              <th className="text-left px-6 py-3">Scoreboard</th>
              <th className="text-left px-6 py-3">Manage</th>
            </tr>
          </thead>
          <tbody>
            {organisations.length > 0 ? (
              organisations.map((org) => (
                <tr key={org.id} className="border-t border-gray-700">
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin-portal/organisation/${org.id}`}
                      className="text-orange-400 hover:text-yellow-400 underline"
                    >
                      {org.organisationName}
                    </Link>
                  </td>
                  <td className="px-6 py-4">—</td>
                  <td className="px-6 py-4">—</td>
                  <td className="px-6 py-4">—</td>
                  <td className="px-6 py-4">0</td>
                  <td className="px-6 py-4">0</td>
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
    </div>
  )
}
