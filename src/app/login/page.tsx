'use client'

import { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth, db } from '@/firebase'
import { useRouter } from 'next/navigation'
import { doc, getDoc, getFirestore } from 'firebase/firestore'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const uid = userCredential.user.uid
      const db = getFirestore()
      const userDoc = await getDoc(doc(db, 'Users', uid))

      if (!userDoc.exists()) {
        setError('No user record found.')
        return
      }

      const userData = userDoc.data()
      const level = userData.level

      if (level === 'super_admin') {
        router.push('/admin-portal')
      } else if (level === 'organiser') {
        router.push('/organiser')
      } else if (level === 'player') {
        router.push('/player')
      } else {
        setError('Access denied.')
      }
    } catch (err: any) {
      setError('Login failed. Check credentials.')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black p-6">
      <img src="/EPLogo1.png" className="w-60 h-60 mb-8" />

      <form 
        onSubmit={handleLogin}
        className="bg-black border border-gray-400 p-10 rounded-2xl shadow-2xl w-full max-w-md flex flex-col gap-6"
      >
        <h1 className="text-3xl font-bold text-center text-white mb-2">Escape Portal</h1>
        {error && <p className="text-red-500 text-center">{error}</p>}

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full p-3 pl-6 bg-gray-700 text-white border border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-300"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full p-3 pl-6 bg-gray-700 text-white border border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-300"
          required
        />

        <button
          type="submit"
          className="w-full bg-orange-500 hover:bg-yellow-400 text-black font-bold py-3 rounded-full transition duration-200"
        >
          Sign In
        </button>
      </form>
    </div>
  )
}
