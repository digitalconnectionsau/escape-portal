'use client';

import Sidebar from '@/components/common/Sidebar';
import RequireRole from '@/components/Auth/RequireRole';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole allowedRoles={['super-admin']}>
      <div className="flex min-h-screen bg-black text-white">
        <Sidebar />
        <main className="flex-1 bg-white text-black p-8">
          {children}
        </main>
      </div>
    </RequireRole>
  );
}

