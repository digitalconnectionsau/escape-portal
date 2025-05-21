// RequireRole.tsx
// Shared component to restrict access based on role

'use client';

import { useAuth } from '@/context/AuthProvider';
import React from 'react';

interface RequireRoleProps {
  allowedRoles: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function RequireRole({ allowedRoles, children, fallback }: RequireRoleProps) {
  const { role, loading } = useAuth();

  if (loading) return null;

  if (!role || !allowedRoles.includes(role)) {
    return fallback || (
      <div className="p-6 text-red-600 font-semibold text-center">
        You do not have permission to view this content.
      </div>
    );
  }

  return <>{children}</>;
}
