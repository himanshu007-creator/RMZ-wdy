import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Contract } from '@/types';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { cn } from '@/lib/utils';

/**
 * Props for the DeleteConfirmationDialog component
 */
export interface DeleteConfirmationDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Function to close the dialog */
  onClose: () => void;
  /** Function called when deletion is confirmed */
  onConfirm: () => void;
  /** Contract to be deleted */
  contract: Contract | null;
  /** Whether the deletion is in progress */
  loading?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Delete confirmation dialog component with special handling for signed contracts
 * Features warning messages, contract details, and proper confirmation flow
 */
export const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  contract,
  loading = false,
  className
}) => {
  if (!contract) return null;

  const isSigned = contract.status === 'signed';

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Contract"
      size="md"
      className={className}
    >
      <div className="space-y-6">
        {/* Warning Icon and Message */}
        <div className="flex items-start space-x-4">
          <div className={cn(
            'flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center',
            isSigned ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
          )}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {isSigned ? 'Delete Signed Contract?' : 'Delete Contract?'}
            </h3>
            
            <p className="text-muted-foreground">
              {isSigned 
                ? 'You are about to delete a signed contract. This action cannot be undone and may have legal implications.'
                : 'Are you sure you want to delete this contract? This action cannot be undone.'
              }
            </p>
          </div>
        </div>

        {/* Contract Details */}
        <div className="bg-muted/30 rounded-lg p-4 space-y-3">
          <h4 className="font-medium text-foreground">Contract Details:</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Client:</span>
              <p className="font-medium text-foreground">{contract.clientName}</p>
            </div>
            
            <div>
              <span className="text-muted-foreground">Event Date:</span>
              <p className="font-medium text-foreground">{formatDate(contract.eventDate)}</p>
            </div>
            
            <div>
              <span className="text-muted-foreground">Venue:</span>
              <p className="font-medium text-foreground">{contract.eventVenue}</p>
            </div>
            
            <div>
              <span className="text-muted-foreground">Amount:</span>
              <p className="font-medium text-foreground">{formatCurrency(contract.amount)}</p>
            </div>
          </div>

          <div>
            <span className="text-muted-foreground text-sm">Package:</span>
            <p className="font-medium text-foreground">{contract.servicePackage}</p>
          </div>

          {/* Status Badge */}
          <div className="flex items-center space-x-2">
            <span className="text-muted-foreground text-sm">Status:</span>
            <span className={cn(
              'px-2 py-1 text-xs font-medium rounded-full',
              isSigned 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
            )}>
              {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
            </span>
          </div>
        </div>

        {/* Additional Warning for Signed Contracts */}
        {isSigned && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
          >
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="font-medium text-red-800 dark:text-red-200 mb-1">
                  Legal Implications
                </h5>
                <p className="text-sm text-red-700 dark:text-red-300">
                  This contract has been digitally signed and may be legally binding. 
                  Deleting it could affect your business records and legal obligations. 
                  Consider archiving instead of deleting.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Confirmation Input */}
        <div className="bg-muted/20 rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-2">
            To confirm deletion, please understand that:
          </p>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>This action cannot be undone</li>
            <li>All contract data will be permanently removed</li>
            {isSigned && <li>Digital signature records will be lost</li>}
            <li>This may affect your business records</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="flex-1 order-2 sm:order-1"
          >
            Cancel
          </Button>
          
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={loading}
            loading={loading}
            leftIcon={!loading ? <Trash2 className="w-4 h-4" /> : undefined}
            className="flex-1 order-1 sm:order-2"
          >
            {loading ? 'Deleting...' : 'Delete Contract'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};