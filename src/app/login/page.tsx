//Login 
//src/app/login/page.tsx
'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/firebase';
import { useRouter } from 'next/navigation';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { USER_ROLES } from '@/constants/roles';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

const handleLogin = async () => {
  try {
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    const user = userCred.user;
    const token = await user.getIdTokenResult(true);
    const role = token.claims.role;
    const userDoc = await getDoc(doc(db, 'Users', user.uid));

    if (!userDoc.exists()) throw new Error('User document not found.');

    const userData = userDoc.data();
    const orgId = userData.organisationId;

    switch (role) {
      case USER_ROLES.SUPER_ADMIN:
        router.push('/admin-portal/dashboard');
        break;

      case USER_ROLES.COMPANY_ADMIN:
        if (orgId) {
          router.push(`/company-portal/company/${orgId}`);
        } else {
          setError('No organisation assigned.');
        }
        break;

      case USER_ROLES.ORGANISER:
        if (orgId) {
          router.push(`/organiser-portal/company/${orgId}`);
        } else {
          setError('No organisation assigned.');
        }
        break;

      case USER_ROLES.PLAYER:
        if (orgId) {
          router.push(`/player-portal/company/${orgId}`);
        } else {
          setError('No organisation assigned.');
        }
        break;

      default:
        setError('Access denied.');
    }
  } catch (err: any) {
    console.error(err);
    setError('Login failed. Please check your credentials.');
  }
};


  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black p-6">
      <img src="/EPLogo1.png" className="w-60 h-60 mb-8" />

     <form
  onSubmit={(e) => {
    e.preventDefault();
    handleLogin();
  }}

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
  );
}
