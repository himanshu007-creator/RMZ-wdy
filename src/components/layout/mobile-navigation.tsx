import React from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { 
  X, 
  User, 
  LogOut, 
  FileText, 
  Plus, 
  Home,
  ChevronRight
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
  badge?: string | number;
}

/**
 * Props for the MobileNavigation component
 */
export interface MobileNavigationProps {
  /** Whether the mobile menu is open */
  isOpen: boolean;
  /** Function to close the mobile menu */
  onClose: () => void;
  /** Navigation items */
  navItems?: NavItem[];
  /** Current active item ID */
  activeItemId?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Enhanced mobile navigation component with touch gestures and animations
 * Features swipe-to-close, smooth animations, and mobile-optimized interactions
 */
export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  isOpen,
  onClose,
  navItems = [],
  activeItemId,
  className
}) => {
  const { user, logout } = useAuthStore();
  const [dragOffset, setDragOffset] = React.useState(0);

  /**
   * Default navigation items if none provided
   */
  const defaultNavItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <Home className="w-5 h-5" />,
      active: activeItemId === 'dashboard'
    },
    {
      id: 'contracts',
      label: 'All Contracts',
      icon: <FileText className="w-5 h-5" />,
      active: activeItemId === 'contracts'
    },
    {
      id: 'new-contract',
      label: 'New Contract',
      icon: <Plus className="w-5 h-5" />,
      active: activeItemId === 'new-contract'
    }
  ];

  const items = navItems.length > 0 ? navItems : defaultNavItems;

  /**
   * Handles user logout
   */
  const handleLogout = async () => {
    await logout();
    onClose();
  };

  /**
   * Handles navigation item click
   */
  const handleNavItemClick = (item: NavItem) => {
    item.onClick?.();
    onClose();
  };

  /**
   * Handles pan gesture for swipe-to-close
   */
  const handlePan = (event: any, info: PanInfo) => {
    if (info.offset.x < 0) {
      setDragOffset(Math.max(info.offset.x, -300));
    }
  };

  /**
   * Handles pan end for swipe-to-close
   */
  const handlePanEnd = (event: any, info: PanInfo) => {
    if (info.offset.x < -100 || info.velocity.x < -500) {
      onClose();
    }
    setDragOffset(0);
  };

  // Prevent body scroll when menu is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={onClose}
          />

          {/* Navigation Panel */}
          <motion.nav
            initial={{ x: '-100%' }}
            animate={{ 
              x: dragOffset < -50 ? dragOffset : 0 
            }}
            exit={{ x: '-100%' }}
            transition={{ 
              type: 'spring', 
              damping: 25, 
              stiffness: 200,
              duration: dragOffset !== 0 ? 0 : undefined
            }}
            drag="x"
            dragConstraints={{ left: -300, right: 0 }}
            dragElastic={0.1}
            onPan={handlePan}
            onPanEnd={handlePanEnd}
            className={cn(
              'fixed top-0 left-0 z-50 w-80 h-full bg-white shadow-xl lg:hidden',
              'flex flex-col',
              className
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="p-2"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* User Profile Section */}
            <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{user?.name}</p>
                  <p className="text-sm text-gray-600 capitalize">{user?.vendorType}</p>
                </div>
                <div className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  Pro
                </div>
              </motion.div>
            </div>

            {/* Navigation Items */}
            <div className="flex-1 p-4 space-y-2 overflow-y-auto">
              {items.map((item, index) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleNavItemClick(item)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200',
                    'hover:bg-gray-50 active:bg-gray-100',
                    item.active
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                      : 'text-gray-700'
                  )}
                >
                  <div className={cn(
                    'p-2 rounded-lg transition-colors',
                    item.active 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'bg-gray-100 text-gray-600'
                  )}>
                    {item.icon}
                  </div>
                  
                  <div className="flex-1">
                    <span className="font-medium">{item.label}</span>
                  </div>

                  {item.badge && (
                    <div className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                      {item.badge}
                    </div>
                  )}

                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </motion.button>
              ))}
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t bg-gray-50 space-y-3">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  leftIcon={<LogOut className="w-4 h-4" />}
                  className="w-full justify-start"
                >
                  Sign Out
                </Button>
              </motion.div>

              {/* Swipe Hint */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center"
              >
                <p className="text-xs text-gray-500">
                  Swipe left to close menu
                </p>
              </motion.div>
            </div>

            {/* Drag Indicator */}
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-full">
              <div className="w-1 h-12 bg-gray-300 rounded-r-full opacity-50" />
            </div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );
};

/**
 * Hook for managing mobile navigation state
 */
export const useMobileNavigation = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  const openMenu = React.useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeMenu = React.useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleMenu = React.useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  return {
    isOpen,
    openMenu,
    closeMenu,
    toggleMenu
  };
};