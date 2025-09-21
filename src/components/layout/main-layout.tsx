'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home,
  Plus,
  LogOut,
  Menu,
  X,
  Sun,
  Moon
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * Props for the MainLayout component
 */
export interface MainLayoutProps {
  /** Page content */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Main application layout with sidebar and theme support
 * Features proper sidebar navigation, theme switching, and mobile responsiveness
 */
export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  className
}) => {
  const { user, logout } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  /**
   * Handles user logout
   */
  const handleLogout = async () => {
    await logout();
  };

  /**
   * Handles dashboard navigation and state reset
   */
  const handleDashboardClick = () => {
    // Reset any global states here if needed
    router.push('/dashboard');
    setIsMobileMenuOpen(false);
  };

  /**
   * Handles create new contract
   */
  const handleCreateContract = () => {
    router.push('/contracts/new');
    setIsMobileMenuOpen(false);
  };

  /**
   * Toggles theme
   */
  const toggleTheme = () => {
    if (typeof window !== 'undefined') {
      setIsDarkMode(!isDarkMode);
      document.documentElement.classList.toggle('dark');
    }
  };

  /**
   * Closes mobile menu
   */
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Initialize theme on mount
  React.useEffect(() => {
    // Only run on client side to avoid hydration mismatch
    if (typeof window !== 'undefined') {
      const isDark = document.documentElement.classList.contains('dark') || 
                     window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(isDark);
      if (isDark) {
        document.documentElement.classList.add('dark');
      }
    }
  }, []);

  // Close mobile menu on route change
  React.useEffect(() => {
    closeMobileMenu();
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  React.useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center px-4">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="mr-4 px-2 lg:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>

          {/* Logo/Brand */}
          <div className="flex-1">
            <span className="font-bold text-lg">Wedding Vendor Portal</span>
          </div>

          {/* Right side - User info and logout */}
          <div className="flex items-center space-x-4">
            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="h-8 w-8 p-0"
            >
              {isDarkMode ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* User name */}
            <span className="text-sm font-medium hidden sm:inline-block">
              {user?.name}
            </span>

            {/* Logout button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-sm"
            >
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:top-14 lg:border-r lg:bg-background">
          <div className="flex flex-col flex-1 p-4 space-y-2">
            {/* Dashboard */}
            <Button
              variant={pathname === '/dashboard' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={handleDashboardClick}
            >
              <Home className="w-4 h-4 mr-3" />
              Dashboard
            </Button>

            {/* Create New Contract */}
            <Button
              variant={pathname === '/contracts/new' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={handleCreateContract}
            >
              <Plus className="w-4 h-4 mr-3" />
              Create New Contract
            </Button>
          </div>
        </aside>

        {/* Mobile Navigation Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                onClick={closeMobileMenu}
              />

              {/* Mobile Sidebar */}
              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed left-0 top-14 z-50 h-[calc(100vh-3.5rem)] w-72 bg-background border-r lg:hidden"
              >
                <div className="flex flex-col h-full">
                  {/* Mobile menu header */}
                  <div className="flex items-center justify-between p-4 border-b">
                    <span className="font-semibold">Navigation</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={closeMobileMenu}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Mobile navigation items */}
                  <div className="flex-1 p-4 space-y-2">
                    {/* Dashboard */}
                    <Button
                      variant={pathname === '/dashboard' ? 'default' : 'ghost'}
                      className="w-full justify-start"
                      onClick={handleDashboardClick}
                    >
                      <Home className="w-4 h-4 mr-3" />
                      Dashboard
                    </Button>

                    {/* Create New Contract */}
                    <Button
                      variant={pathname === '/contracts/new' ? 'default' : 'ghost'}
                      className="w-full justify-start"
                      onClick={handleCreateContract}
                    >
                      <Plus className="w-4 h-4 mr-3" />
                      Create New Contract
                    </Button>
                  </div>

                  {/* Mobile user info */}
                  <div className="p-4 border-t bg-muted/30">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-medium">
                          {user?.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{user?.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{user?.vendorType}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className={cn(
          'flex-1 lg:ml-64',
          className
        )}>
          <div className="p-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};