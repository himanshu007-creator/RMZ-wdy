import React from 'react';
import Image from 'next/image';
import { CheckCircle } from 'lucide-react';
import { SignatureData } from '@/types';
import { cn } from '@/lib/utils';
import { formatSignatureForDisplay } from '@/lib/signature-utils';

/**
 * Props for the SignatureDisplay component
 */
export interface SignatureDisplayProps {
  /** Signature data to display */
  signature: SignatureData;
  /** Whether to show the timestamp */
  showTimestamp?: boolean;
  /** Whether to show the signed status indicator */
  showStatus?: boolean;
  /** Size of the signature display */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
}

/**
 * Reusable component for displaying digital signatures
 * Handles both drawn and typed signatures with proper formatting
 * Includes timestamp and status indicators with responsive design
 */
export const SignatureDisplay: React.FC<SignatureDisplayProps> = ({
  signature,
  showTimestamp = true,
  showStatus = true,
  size = 'md',
  className
}) => {
  // Format signature data for display
  const formattedSignature = formatSignatureForDisplay(signature);

  const sizeClasses = {
    sm: {
      container: 'p-3',
      signature: signature.type === 'drawn' ? 'h-12' : 'text-lg',
      text: 'text-xs'
    },
    md: {
      container: 'p-4',
      signature: signature.type === 'drawn' ? 'h-16' : 'text-2xl',
      text: 'text-sm'
    },
    lg: {
      container: 'p-6',
      signature: signature.type === 'drawn' ? 'h-20' : 'text-3xl',
      text: 'text-base'
    }
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={cn('space-y-4', className)}>
      {/* Status Indicator */}
      {showStatus && (
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">Contract Signed</span>
        </div>
      )}
      
      {/* Signature Container */}
      <div className={cn(
        'bg-gray-50 rounded-lg border border-gray-200',
        currentSize.container
      )}>
        {signature.type === 'drawn' ? (
          <div>
            <p className={cn('text-gray-600 mb-2', currentSize.text)}>
              Drawn Signature:
            </p>
            <div className={cn(
              'relative max-w-xs border border-gray-200 rounded bg-white',
              currentSize.signature
            )}>
              <Image
                src={formattedSignature.displayData}
                alt="Digital signature"
                fill
                className="object-contain p-1"
                sizes="(max-width: 384px) 100vw, 384px"
              />
            </div>
          </div>
        ) : (
          <div>
            <p className={cn('text-gray-600 mb-2', currentSize.text)}>
              Typed Signature:
            </p>
            <div 
              className={cn(
                'text-gray-900 py-2',
                currentSize.signature
              )}
              style={{ 
                fontFamily: 'cursive',
                fontStyle: 'italic'
              }}
            >
              {formattedSignature.displayData}
            </div>
          </div>
        )}
        
        {/* Timestamp */}
        {showTimestamp && (
          <p className={cn('text-gray-500 mt-2', currentSize.text)}>
            Signed on {formattedSignature.timestamp}
          </p>
        )}
      </div>
    </div>
  );
};