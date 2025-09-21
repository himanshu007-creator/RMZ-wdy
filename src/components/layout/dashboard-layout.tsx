import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  FileText, 
  Plus,
  Home,
  Settings
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { MobileNavigation } from './mobile-navigation';
import { cn } from '@/lib/utils';

/**
 * Props for the DashboardLayout component
 */
export interface DashboardLayoutProps {
  /** Page content */
  children: React.ReactNode;
  /** Current page title */
  title?: string;
  /** Current page subtitle */
  subtitle?: string;
  /** Additional actions for the header */
  headerActions?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Navigation item interface
 */
interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
  active?: boolean;
}

/**
 * Main dashboard layout component with responsive navigation
 * Features mobile-first design with hamburger menu, consistent styling, and animations
 */
export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  title = 'Dashboard',
  subtitle,
  headerActions,
  className
}) => {
  const { user, logout } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  /**
   * Handles user logout
   */
  const handleLogout = async () => {
    await logout();
    setIsMobileMenuOpen(false);
  };

  /**
   * Closes mobile menu
   */
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  /**
   * Navigation items configuration
   */
  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <Home className="w-5 h-5" />,
      active: true
    },
    {
      id: 'contracts',
      label: 'All Contracts',
      icon: <FileText className="w-5 h-5" />
    },
    {
      id: 'new-contract',
      label: 'New Contract',
      icon: <Plus className="w-5 h-5" />
    }
  ];

  // Close mobile menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isMobileMenuOpen && !target.closest('[data-mobile-menu]')) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

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
    <div className={cn('min-h-screen bg-gray-50', className)}>
      {/* Mobile Menu Backdrop */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={closeMobileMenu}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side - Logo and mobile menu button */}
            <div className="flex items-center gap-4">
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>

              {/* Logo/Title */}
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Wedding Vendor Portal
                </h1>
              </div>
            </div>

            {/* Right side - User info and actions */}
            <div className="flex items-center gap-4">
              {/* Header actions */}
              {headerActions && (
                <div className="hidden sm:flex items-center gap-2">
                  {headerActions}
                </div>
              )}

              {/* User info - Desktop */}
              <div className="hidden sm:flex items-center text-sm text-gray-700">
                <User className="w-4 h-4 mr-2" />
                <span className="mr-2">{user?.name}</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  {user?.vendorType}
                </span>
              </div>

              {/* Logout button - Desktop */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                leftIcon={<LogOut className="w-4 h-4" />}
                className="hidden sm:flex"
              >
                Logout
              </Button>

              {/* User avatar - Mobile */}
              <Button
                variant="ghost"
                size="sm"
                className="sm:hidden p-2"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <User className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      <MobileNavigation
        isOpen={isMobileMenuOpen}
        onClose={closeMobileMenu}
        navItems={navItems}
        activeItemId="dashboard"
      />

      {/* Desktop Navigation - Optional sidebar for larger screens */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-20 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white border-r px-6 py-4">
          <div className="flex h-16 shrink-0 items-center">
            <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
          </div>
          
          <nav className="flex flex-1 flex-col">
            <ul className="flex flex-1 flex-col gap-y-2">
              {navItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={item.onClick}
                    className={cn(
                      'group flex gap-x-3 rounded-md p-3 text-sm leading-6 font-semibold w-full text-left transition-colors',
                      item.active
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:text-blue-700 hover:bg-gray-50'
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:pl-64">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          {/* Page Header */}
          {(title || subtitle || headerActions) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                  {subtitle && (
                    <p className="mt-1 text-gray-600">{subtitle}</p>
                  )}
                </div>
                
                {headerActions && (
                  <div className="flex items-center gap-2 sm:hidden">
                    {headerActions}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Page Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
};