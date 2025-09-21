import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  Clock, 
  PenTool, 
  FileText, 
  AlertCircle,
  ArrowRight,
  User,
  Calendar,
  MapPin,
  DollarSign
} from 'lucide-react';
import { Contract, SignatureData } from '@/types';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { SignatureModal } from './signature-modal';
import { SignatureDisplay } from './signature-display';
import { LoadingState } from '@/components/ui/loading-state';
import { cn } from '@/lib/utils';

/**
 * Contract signing workflow step
 */
interface SigningStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'pending' | 'current' | 'completed';
}

/**
 * Props for the ContractSigningWorkflow component
 */
export interface ContractSigningWorkflowProps {
  /** Contract to sign */
  contract: Contract;
  /** Whether the signing process is loading */
  loading?: boolean;
  /** Function called when signature is confirmed */
  onSignatureConfirm: (signature: SignatureData) => Promise<void>;
  /** Function called when workflow is cancelled */
  onCancel: () => void;
  /** Function called when workflow is completed */
  onComplete?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Contract signing workflow component with step-by-step process
 * Features mobile-optimized interactions, status updates, and comprehensive error handling
 */
export const ContractSigningWorkflow: React.FC<ContractSigningWorkflowProps> = ({
  contract,
  loading = false,
  onSignatureConfirm,
  onCancel,
  onComplete,
  className
}) => {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = React.useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = React.useState(false);
  const [pendingSignature, setPendingSignature] = React.useState<SignatureData | null>(null);
  const [error, setError] = React.useState<string | null>(null);

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

  /**
   * Signing workflow steps
   */
  const steps: SigningStep[] = [
    {
      id: 'review',
      title: 'Review Contract',
      description: 'Review all contract details and terms',
      icon: <FileText className="w-5 h-5" />,
      status: currentStep > 0 ? 'completed' : 'current'
    },
    {
      id: 'sign',
      title: 'Digital Signature',
      description: 'Apply your digital signature',
      icon: <PenTool className="w-5 h-5" />,
      status: currentStep > 1 ? 'completed' : currentStep === 1 ? 'current' : 'pending'
    },
    {
      id: 'complete',
      title: 'Contract Signed',
      description: 'Contract is now legally binding',
      icon: <CheckCircle className="w-5 h-5" />,
      status: currentStep > 2 ? 'completed' : currentStep === 2 ? 'current' : 'pending'
    }
  ];

  /**
   * Handles proceeding to signature step
   */
  const handleProceedToSignature = () => {
    setCurrentStep(1);
    setIsSignatureModalOpen(true);
  };

  /**
   * Handles signature creation
   */
  const handleSignatureCreate = (signature: SignatureData) => {
    setPendingSignature(signature);
    setIsSignatureModalOpen(false);
    setIsConfirmModalOpen(true);
  };

  /**
   * Handles signature confirmation
   */
  const handleConfirmSignature = async () => {
    if (!pendingSignature) return;

    try {
      setError(null);
      await onSignatureConfirm(pendingSignature);
      setCurrentStep(2);
      setIsConfirmModalOpen(false);
      
      // Auto-complete after a short delay
      setTimeout(() => {
        onComplete?.();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign contract');
    }
  };

  /**
   * Handles cancelling signature confirmation
   */
  const handleCancelSignature = () => {
    setPendingSignature(null);
    setIsConfirmModalOpen(false);
    setCurrentStep(1);
    setIsSignatureModalOpen(true);
  };

  /**
   * Handles workflow cancellation - returns to first step
   */
  const handleCancel = () => {
    setIsSignatureModalOpen(false);
    setIsConfirmModalOpen(false);
    setPendingSignature(null);
    setCurrentStep(0);
    setError(null);
  };

  /**
   * Handles complete workflow cancellation - exits workflow
   */
  const handleCompleteCancel = () => {
    setIsSignatureModalOpen(false);
    setIsConfirmModalOpen(false);
    setPendingSignature(null);
    setCurrentStep(0);
    setError(null);
    onCancel();
  };

  return (
    <div className={cn('max-w-4xl mx-auto', className)}>
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors',
                    step.status === 'completed'
                      ? 'bg-green-100 border-green-500 text-green-600'
                      : step.status === 'current'
                      ? 'bg-blue-100 border-blue-500 text-blue-600'
                      : 'bg-gray-100 border-gray-300 text-gray-400'
                  )}
                >
                  {step.status === 'completed' ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : step.status === 'current' ? (
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {step.icon}
                    </motion.div>
                  ) : (
                    step.icon
                  )}
                </motion.div>
                
                <div className="mt-2 text-center">
                  <p className={cn(
                    'text-sm font-medium',
                    step.status === 'current' ? 'text-blue-600' : 'text-gray-600'
                  )}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 hidden sm:block">
                    {step.description}
                  </p>
                </div>
              </div>
              
              {index < steps.length - 1 && (
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: currentStep > index ? 1 : 0.3 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={cn(
                    'flex-1 h-0.5 mx-4 origin-left',
                    currentStep > index ? 'bg-green-500' : 'bg-gray-300'
                  )}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div>
              <p className="text-red-800 font-medium">Signing Failed</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              Dismiss
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {/* Step 1: Review Contract */}
        {currentStep === 0 && (
          <motion.div
            key="review"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Contract Summary */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contract Summary</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="font-medium text-gray-900">{formatCurrency(contract.amount)}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium text-gray-900 mb-2">Service Package</h3>
                <p className="text-gray-700">{contract.servicePackage}</p>
              </div>
            </div>

            {/* Contract Terms */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contract Terms</h2>
              <div 
                className="prose prose-sm max-w-none text-gray-900 max-h-64 overflow-y-auto"
                dangerouslySetInnerHTML={{ __html: contract.content }}
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <Button
                variant="outline"
                onClick={handleCompleteCancel}
                className="order-2 sm:order-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleProceedToSignature}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="order-1 sm:order-2"
              >
                Proceed to Sign
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Signing Complete */}
        {currentStep === 2 && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="w-10 h-10 text-green-600" />
            </motion.div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Contract Signed Successfully!
            </h2>
            <p className="text-gray-600 mb-8">
              Your contract with {contract.clientName} has been digitally signed and is now legally binding.
            </p>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-green-800 text-sm">
                A copy of the signed contract has been saved to your account.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Signature Modal */}
      <SignatureModal
        isOpen={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        onConfirm={handleSignatureCreate}
        loading={loading}
      />

      {/* Signature Confirmation Modal */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={handleCancelSignature}
        title="Confirm Signature"
        size="md"
      >
        <div className="space-y-6">
          <p className="text-gray-700">
            Please review your signature below. Once confirmed, this contract will be legally binding.
          </p>

          {pendingSignature && (
            <div className="border border-gray-200 rounded-lg p-4">
              <SignatureDisplay 
                signature={pendingSignature}
                showTimestamp={false}
                showStatus={false}
                size="md"
              />
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={handleCancelSignature}
              className="flex-1"
            >
              Change Signature
            </Button>
            <Button
              onClick={handleConfirmSignature}
              loading={loading}
              className="flex-1"
            >
              Confirm & Sign Contract
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};