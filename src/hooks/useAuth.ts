// useAuth.ts
// src/hooks/useAuth.ts

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/firebase';

export function useRoleGuard(allowedRoles: string[]) {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/login');
        return;
      }

      const userDoc = await getDoc(doc(db, 'Users', user.uid));
      const userData = userDoc.data();

      if (!userData || !allowedRoles.includes(userData.role)) {
        router.push('/unauthorized'); // Or a custom 403 page
      }
    });

    return () => unsubscribe();
  }, [allowedRoles, router]);
}
