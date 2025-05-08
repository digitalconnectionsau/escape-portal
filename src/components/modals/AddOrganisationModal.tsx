// NewOrganisationModal.tsx
'use client'

import { useEffect, useState } from 'react'
import { collection, addDoc, query, where, getDocs, doc, setDoc, updateDoc } from 'firebase/firestore'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { db, auth } from '@/firebase'

interface Props {
  onClose: () => void
  onCreated?: () => void
}

export default function NewOrganisationModal({ onClose, onCreated }: Props) {
  const [orgName, setOrgName] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [existingUser, setExistingUser] = useState<any>(null)
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState('')

  const handleEmailBlur = async () => {
    if (!email) return
    setChecking(true)
    setError('')
    try {
      const q = query(collection(db, 'Users'), where('email', '==', email))
      const snap = await getDocs(q)
      if (!snap.empty) {
        setExistingUser(snap.docs[0])
      } else {
        setExistingUser(null)
      }
    } catch (err) {
      setError('Error checking email.')
    } finally {
      setChecking(false)
    }
  }

  const handleSubmit = async () => {
    try {
      let userId = ''

      if (existingUser) {
        userId = existingUser.id
      } else {
        const userCred = await createUserWithEmailAndPassword(auth, email, password)
        userId = userCred.user.uid
      }

      const newOrgRef = await addDoc(collection(db, 'Organisations'), {
        organisationName: orgName,
        organisationAdminId: userId,
        status: 'active'
      })

      if (!existingUser) {
        await setDoc(doc(db, 'Users', userId), {
          uid: userId,
          firstName,
          lastName,
          email,
          role: 'company-admin',
          organisationId: newOrgRef.id
        })
      } else {
        await updateDoc(doc(db, 'Users', userId), {
          organisationId: newOrgRef.id
        })
      }

      onCreated?.()
      onClose()
    } catch (err) {
      console.error(err)
      setError('Failed to create organisation.')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">Add New Organisation</h2>

        <div className="mb-3">
          <label className="block text-sm font-medium">Organisation Name</label>
          <input type="text" className="w-full p-2 border rounded" value={orgName} onChange={e => setOrgName(e.target.value)} />
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium">First Name</label>
          <input type="text" className="w-full p-2 border rounded" value={firstName} onChange={e => setFirstName(e.target.value)} />
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium">Last Name</label>
          <input type="text" className="w-full p-2 border rounded" value={lastName} onChange={e => setLastName(e.target.value)} />
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium">Email</label>
          <input type="email" className="w-full p-2 border rounded" value={email} onChange={e => setEmail(e.target.value)} onBlur={handleEmailBlur} />
        </div>

        {!existingUser && (
          <div className="mb-3">
            <label className="block text-sm font-medium">Password</label>
            <input type="password" className="w-full p-2 border rounded" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
        )}

        {existingUser && (
          <div className="text-green-700 text-sm mb-3">User already exists and will be linked.</div>
        )}

        {error && <div className="text-red-600 text-sm mb-3">{error}</div>}

        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 bg-gray-200 rounded" onClick={onClose}>Cancel</button>
          <button className="px-4 py-2 bg-orange-500 text-white font-bold rounded" onClick={handleSubmit}>Save</button>
        </div>
      </div>
    </div>
  )
}
