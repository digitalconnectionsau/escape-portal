// Dashboard
// src/app/admin

'use client';

import { useEffect } from 'react';
import Image from "next/image";
import Link from "next/link";
import { auth } from '@/firebase';

export default function Home() {
  useEffect(() => {
    auth.currentUser?.getIdTokenResult().then((idTokenResult) => {
      console.log('[DEBUG] Token Claims:', idTokenResult.claims);
    });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12 bg-black text-gray-200 gap-12">
      <Image
        src="/EPLogo1.png"
        alt="Escape Portal Logo"
        width={220}
        height={80}
        priority
        className="object-contain"
      />
      <h1 className="text-4xl font-bold text-center text-white">
        Welcome to the Escape Portal
      </h1>
      <p className="text-lg text-gray-400 text-center max-w-xl">
        Your gateway to cybersecurity awareness and immersive training games.
      </p>
      <Link
        href="/login"
        className="bg-orange-500 text-black font-semibold px-6 py-3 rounded-full text-lg hover:bg-orange-400 transition-all shadow-md"
      >
        Login to Escape Portal
      </Link>
    </div>
  );
}
