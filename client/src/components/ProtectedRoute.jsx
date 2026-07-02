import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, accessToken, loading } = useAuthStore();
  const location = useLocation();

  // Show a clean loading state if store is in loading phase
  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center">
        <div className="relative w-16 h-16">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-brand-500/20 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-t-brand-500 border-r-brand-500 rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-dark-300 font-medium tracking-wide animate-pulse">Loading MODIT Secure Shell...</p>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!accessToken || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if role is authorized
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their allowed homepage/dashboard
    const defaultRedirect = `/dashboard/${user.role}`;
    return <Navigate to={defaultRedirect} replace />;
  }

  return children;
};

export default ProtectedRoute;
