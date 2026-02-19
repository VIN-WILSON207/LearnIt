'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.push('/');
      return;
    }

    if (requiredRole && user.role.toLowerCase() !== requiredRole.toLowerCase()) {
      router.push(`/${user.role.toLowerCase()}/dashboard`);
    }
  }, [user, isLoading, requiredRole, router]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user || (requiredRole && user.role.toLowerCase() !== requiredRole.toLowerCase())) {
    return null;
  }

  return <>{children}</>;
};
