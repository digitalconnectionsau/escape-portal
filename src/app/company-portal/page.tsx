//Company portal Dashboard
//src/app/company-portal/page.tsx

'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthProvider';
import RequireRole from '@/components/Auth/RequireRole';

export default function CompanyDashboardPage() {
  const { user } = useAuth();

  return (
    <RequireRole allowedRoles={['company-admin', 'org-manager', 'super-admin']}>
      <div className="min-h-screen p-8 bg-black text-white flex flex-col gap-6">
        <h1 className="text-3xl font-bold">🏢 Company Admin Portal</h1>
        <p className="text-lg text-gray-300">
          Welcome <strong>{user?.email}</strong> – manage your organisation here.
        </p>

        <div className="mt-4">
          <Link
            href="/company-portal/company"
            className="bg-orange-500 hover:bg-orange-400 text-black font-semibold px-6 py-3 rounded"
          >
            Manage Company
          </Link>
        </div>
      </div>
    </RequireRole>
  );
}


