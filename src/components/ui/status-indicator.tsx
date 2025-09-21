import React from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  XCircle, 
  FileText,
  PenTool,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Status types for the indicator
 */
export type StatusType = 
  | 'draft' 
  | 'signed' 
  | 'pending' 
  | 'error' 
  | 'loading' 
  | 'success' 
  | 'warning' 
  | 'info';

/**
 * Status indicator size types
 */
type StatusSize = 'sm' | 'md' | 'lg';

/**
 * Props for the StatusIndicator component
 */
export interface StatusIndicatorProps {
  /** Status type to display */
  status: StatusType;
  /** Size of the indicator */
  size?: StatusSize;
  /** Custom label text */
  label?: string;
  /** Whether to show the label */
  showLabel?: boolean;
  /** Whether to animate the indicator */
  animate?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Custom icon override */
  icon?: React.ReactNode;
}

/**
 * Status configuration mapping
 */
const statusConfig: Record<StatusType, {
  icon: React.ReactNode;
  label: string;
  colorClasses: string;
  bgClasses: string;
}> = {
  draft: {
    icon: <FileText className="w-4 h-4" />,
    label: 'Draft',
    colorClasses: 'text-yellow-600',
    bgClasses: 'bg-yellow-100 border-yellow-200'
  },
  signed: {
    icon: <CheckCircle className="w-4 h-4" />,
    label: 'Signed',
    colorClasses: 'text-green-600',
    bgClasses: 'bg-green-100 border-green-200'
  },
  pending: {
    icon: <Clock className="w-4 h-4" />,
    label: 'Pending',
    colorClasses: 'text-blue-600',
    bgClasses: 'bg-blue-100 border-blue-200'
  },
  error: {
    icon: <XCircle className="w-4 h-4" />,
    label: 'Error',
    colorClasses: 'text-red-600',
    bgClasses: 'bg-red-100 border-red-200'
  },
  loading: {
    icon: <Loader2 className="w-4 h-4 animate-spin" />,
    label: 'Loading',
    colorClasses: 'text-gray-600',
    bgClasses: 'bg-gray-100 border-gray-200'
  },
  success: {
    icon: <CheckCircle className="w-4 h-4" />,
    label: 'Success',
    colorClasses: 'text-green-600',
    bgClasses: 'bg-green-100 border-green-200'
  },
  warning: {
    icon: <AlertCircle className="w-4 h-4" />,
    label: 'Warning',
    colorClasses: 'text-orange-600',
    bgClasses: 'bg-orange-100 border-orange-200'
  },
  info: {
    icon: <AlertCircle className="w-4 h-4" />,
    label: 'Info',
    colorClasses: 'text-blue-600',
    bgClasses: 'bg-blue-100 border-blue-200'
  }
};

/**
 * Reusable status indicator component with animations and consistent styling
 * Features multiple status types, sizes, and customizable appearance
 */
export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  size = 'md',
  label,
  showLabel = true,
  animate = true,
  className,
  icon
}) => {
  const config = statusConfig[status];
  const displayLabel = label || config.label;

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const iconSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const iconElement = icon || React.cloneElement(
    config.icon as React.ReactElement,
    { className: iconSizeClasses[size] }
  );

  const content = (
    <div className={cn(
      'inline-flex items-center gap-2 rounded-full border font-medium',
      config.colorClasses,
      config.bgClasses,
      sizeClasses[size],
      className
    )}>
      {iconElement}
      {showLabel && <span>{displayLabel}</span>}
    </div>
  );

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        {content}
      </motion.div>
    );
  }

  return content;
};

/**
 * Contract-specific status indicator
 */
export const ContractStatusIndicator: React.FC<{
  status: 'draft' | 'signed' | 'deleted';
  size?: StatusSize;
  className?: string;
}> = ({ status, size = 'md', className }) => {
  const statusMap = {
    draft: 'draft' as StatusType,
    signed: 'signed' as StatusType,
    deleted: 'error' as StatusType
  };

  return (
    <StatusIndicator
      status={statusMap[status]}
      size={size}
      className={className}
    />
  );
};

/**
 * Loading status indicator with pulse animation
 */
export const LoadingStatusIndicator: React.FC<{
  message?: string;
  size?: StatusSize;
  className?: string;
}> = ({ message = 'Loading', size = 'md', className }) => (
  <motion.div
    animate={{ opacity: [0.5, 1, 0.5] }}
    transition={{ duration: 1.5, repeat: Infinity }}
  >
    <StatusIndicator
      status="loading"
      label={message}
      size={size}
      animate={false}
      className={className}
    />
  </motion.div>
);

/**
 * Success status indicator with check animation
 */
export const SuccessStatusIndicator: React.FC<{
  message?: string;
  size?: StatusSize;
  className?: string;
}> = ({ message = 'Success', size = 'md', className }) => (
  <motion.div
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    transition={{ type: 'spring', duration: 0.5 }}
  >
    <StatusIndicator
      status="success"
      label={message}
      size={size}
      animate={false}
      className={className}
    />
  </motion.div>
);

/**
 * Error status indicator with shake animation
 */
export const ErrorStatusIndicator: React.FC<{
  message?: string;
  size?: StatusSize;
  className?: string;
}> = ({ message = 'Error', size = 'md', className }) => (
  <motion.div
    initial={{ x: 0 }}
    animate={{ x: [-5, 5, -5, 5, 0] }}
    transition={{ duration: 0.5 }}
  >
    <StatusIndicator
      status="error"
      label={message}
      size={size}
      animate={false}
      className={className}
    />
  </motion.div>
);