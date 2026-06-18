'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode; requiredRole?: 'customer' | 'admin' }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) { router.replace('/login'); return; }
      if (requiredRole && user?.role !== requiredRole) router.replace(user?.role === 'admin' ? '/admin' : '/dashboard');
    }
  }, [isAuthenticated, isLoading, user, requiredRole, router]);

  if (isLoading) return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner spinner-lg" />
    </div>
  );

  if (!isAuthenticated || (requiredRole && user?.role !== requiredRole)) return null;
  return <>{children}</>;
}
