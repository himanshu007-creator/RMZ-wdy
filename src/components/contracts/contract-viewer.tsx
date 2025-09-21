import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  DollarSign, 
  User, 
  Package,
  FileText,
  CheckCircle,
  Edit,
  PenTool,
  Download
} from 'lucide-react';
import { Contract } from '@/types';
import { Button } from '@/components/ui/button';
import { SignatureDisplay } from './signature-display';
import { ContractStatusIndicator } from '@/components/ui/status-indicator';
import { downloadContractPDF } from '@/lib/pdf-utils';
import { cn } from '@/lib/utils';

/**
 * Props for the ContractViewer component
 */
export interface ContractViewerProps {
  /** Contract to display */
  contract: Contract;
  /** Function called when going back */
  onBack: () => void;
  /** Function called when editing contract (only for draft contracts) */
  onEdit?: () => void;
  /** Function called when signing contract (only for draft contracts) */
  onSign?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Contract viewer component for read-only display of signed contracts
 * Features mobile-friendly layout, signature display, and responsive design
 */
export const ContractViewer: React.FC<ContractViewerProps> = ({
  contract,
  onBack,
  onEdit,
  onSign,
  className
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isDraft = contract.status === 'draft';
  const isSigned = contract.status === 'signed';

  /**
   * Handles PDF download
   */
  const handleDownloadPDF = async () => {
    try {
      await downloadContractPDF(contract);
    } catch (error) {
      console.error('Failed to download PDF:', error);
      // You could show a toast notification here
    }
  };

  return (
    <div className={cn('max-w-4xl mx-auto', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={onBack}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            className="p-2"
          />
          
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Contract - {contract.clientName}
            </h1>
            <div className="mt-1">
              <ContractStatusIndicator 
                status={contract.status}
                size="sm"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {/* Download PDF button - always available */}
          <Button
            variant="outline"
            onClick={handleDownloadPDF}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Download PDF
          </Button>

          {/* Draft-specific actions */}
          {isDraft && (
            <>
              {onEdit && (
                <Button
                  variant="outline"
                  onClick={onEdit}
                  leftIcon={<Edit className="w-4 h-4" />}
                >
                  Edit
                </Button>
              )}
              
              {onSign && (
                <Button
                  onClick={onSign}
                  leftIcon={<PenTool className="w-4 h-4" />}
                >
                  Sign Contract
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Contract Details */}
      <div className="space-y-6">
        {/* Contract Information Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-200 rounded-lg p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Contract Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Client</p>
                <p className="font-medium text-gray-900">{contract.clientName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Event Date</p>
                <p className="font-medium text-gray-900">{formatDate(contract.eventDate)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <MapPin className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Venue</p>
                <p className="font-medium text-gray-900">{contract.eventVenue}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Package className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Service Package</p>
                <p className="font-medium text-gray-900">{contract.servicePackage}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Amount</p>
                <p className="font-medium text-gray-900">{formatCurrency(contract.amount)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <FileText className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Created</p>
                <p className="font-medium text-gray-900">{formatTimestamp(contract.createdAt)}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Contract Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white border border-gray-200 rounded-lg p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Contract Terms</h2>
          
          <div 
            className="prose prose-sm max-w-none text-gray-900"
            dangerouslySetInnerHTML={{ __html: contract.content }}
          />
        </motion.div>

        {/* Signature Section */}
        {isSigned && contract.signature && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white border border-gray-200 rounded-lg p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Digital Signature</h2>
            
            <SignatureDisplay 
              signature={contract.signature}
              showTimestamp={true}
              showStatus={true}
              size="md"
            />
          </motion.div>
        )}

        {/* Draft Notice */}
        {isDraft && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
          >
            <div className="flex items-center gap-2 text-yellow-800">
              <FileText className="w-5 h-5" />
              <span className="font-medium">Draft Contract</span>
            </div>
            <p className="text-yellow-700 mt-1">
              This contract is still in draft status. You can edit the details or sign it to finalize.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};