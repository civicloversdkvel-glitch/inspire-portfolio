import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAcademyAuth } from './AcademyAuthContext';
import { UserRole } from './types';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { Loader2 } from 'lucide-react';

interface AcademyProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function AcademyProtectedRoute({ children, allowedRoles }: AcademyProtectedRouteProps) {
  const { user, profile, loading } = useAcademyAuth();
  const location = useLocation();

  if (loading) {
    return (
      <ScreenWrapper className="bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 p-6 text-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-xs font-bold text-gray-600">Verifying Academy Session...</p>
        </div>
      </ScreenWrapper>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/academy/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    const fallback = profile.role === 'admin' ? '/admin' : '/academy';
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
}
