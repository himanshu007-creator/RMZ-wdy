'use client';

import React, { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';

/**
 * Props for the AuthGuard component
 */
interface AuthGuardProps {
  /** Child components to render when authenticated */
  children: ReactNode;
  /** Optional redirect path for unauthenticated users (defaults to /login) */
  redirectTo?: string;
}

/**
 * Authentication guard component that protects routes requiring authentication
 * 
 * This component:
 * - Initializes authentication state on mount
 * - Shows loading spinner while checking authentication
 * - Redirects unauthenticated users to login page
 * - Renders children only when user is authenticated
 * 
 * @param children - Components to render when user is authenticated
 * @param redirectTo - Path to redirect unauthenticated users (default: /login)
 */
export function AuthGuard({ children, redirectTo = '/login' }: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, initializeAuth } = useAuthStore();

  // Initialize authentication state on component mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Redirect to login if not authenticated (after loading completes)
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="inline-block"
          >
            <Loader2 className="w-8 h-8 text-blue-600" />
          </motion.div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </motion.div>
      </div>
    );
  }

  // Don't render children if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  // Render children with fade-in animation when authenticated
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}