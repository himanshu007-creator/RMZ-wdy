import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, FileText, User, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Loading state variant types
 */
type LoadingVariant = 'spinner' | 'skeleton' | 'pulse' | 'dots';

/**
 * Loading state size types
 */
type LoadingSize = 'sm' | 'md' | 'lg';

/**
 * Props for the LoadingState component
 */
export interface LoadingStateProps {
  /** Loading variant to display */
  variant?: LoadingVariant;
  /** Size of the loading indicator */
  size?: LoadingSize;
  /** Loading message to display */
  message?: string;
  /** Whether to show the loading message */
  showMessage?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Whether to center the loading state */
  centered?: boolean;
}

/**
 * Reusable loading state component with multiple variants
 * Features consistent styling, animations, and accessibility support
 */
export const LoadingState: React.FC<LoadingStateProps> = ({
  variant = 'spinner',
  size = 'md',
  message = 'Loading...',
  showMessage = true,
  className,
  centered = true
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const containerClasses = cn(
    'flex items-center gap-3',
    centered && 'justify-center',
    className
  );

  const renderSpinner = () => (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className={cn(
        'border-2 border-blue-600 border-t-transparent rounded-full',
        sizeClasses[size]
      )}
    />
  );

  const renderDots = () => (
    <div className="flex gap-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2
          }}
          className={cn(
            'bg-blue-600 rounded-full',
            size === 'sm' ? 'w-1 h-1' : size === 'md' ? 'w-2 h-2' : 'w-3 h-3'
          )}
        />
      ))}
    </div>
  );

  const renderPulse = () => (
    <motion.div
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity }}
      className={cn(
        'bg-blue-600 rounded-full',
        sizeClasses[size]
      )}
    />
  );

  const renderSkeleton = () => (
    <div className="space-y-3 w-full max-w-sm">
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="h-4 bg-gray-200 rounded"
      />
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
        className="h-4 bg-gray-200 rounded w-3/4"
      />
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
        className="h-4 bg-gray-200 rounded w-1/2"
      />
    </div>
  );

  const renderLoadingIndicator = () => {
    switch (variant) {
      case 'dots':
        return renderDots();
      case 'pulse':
        return renderPulse();
      case 'skeleton':
        return renderSkeleton();
      default:
        return renderSpinner();
    }
  };

  return (
    <div className={containerClasses} role="status" aria-label={message}>
      {variant !== 'skeleton' && renderLoadingIndicator()}
      {variant === 'skeleton' && renderSkeleton()}
      
      {showMessage && variant !== 'skeleton' && (
        <span className="text-gray-600 text-sm font-medium">
          {message}
        </span>
      )}
      
      <span className="sr-only">{message}</span>
    </div>
  );
};

/**
 * Contract list skeleton loading component
 */
export const ContractListSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, index) => (
      <motion.div
        key={index}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: index * 0.1 }}
        className="bg-white border border-gray-200 rounded-lg p-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-8 h-8 bg-gray-200 rounded-full"
              />
              <div className="space-y-2 flex-1">
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.1 }}
                  className="h-5 bg-gray-200 rounded w-1/3"
                />
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                  className="h-4 bg-gray-200 rounded w-20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 + i * 0.1 }}
                  className="h-4 bg-gray-200 rounded"
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 + i * 0.1 }}
                className="w-16 h-8 bg-gray-200 rounded"
              />
            ))}
          </div>
        </div>
      </motion.div>
    ))}
  </div>
);

/**
 * Contract form skeleton loading component
 */
export const ContractFormSkeleton: React.FC = () => (
  <div className="max-w-4xl mx-auto space-y-6">
    <div className="flex items-center gap-4 mb-6">
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="w-8 h-8 bg-gray-200 rounded"
      />
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.1 }}
        className="h-8 bg-gray-200 rounded w-1/3"
      />
    </div>

    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
              className="h-4 bg-gray-200 rounded w-1/4"
            />
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 + i * 0.1 }}
              className="h-10 bg-gray-200 rounded"
            />
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.8 }}
          className="h-4 bg-gray-200 rounded w-1/6"
        />
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.9 }}
          className="h-32 bg-gray-200 rounded"
        />
      </div>
    </div>
  </div>
);

/**
 * Page loading component for full-page loading states
 */
export const PageLoading: React.FC<{ message?: string }> = ({ 
  message = 'Loading page...' 
}) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <LoadingState size="lg" message={message} />
    </div>
  </div>
);