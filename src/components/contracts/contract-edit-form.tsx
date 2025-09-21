import React from 'react';
import { motion } from 'framer-motion';
import { Save, X, PenTool } from 'lucide-react';
import { Contract, SignatureData } from '@/types';
import { useContractStore } from '@/stores/contract-store';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { AIAssistModal } from './ai-assist-modal';
import { ContractSigningWorkflow } from './contract-signing-workflow';
import { cn } from '@/lib/utils';

/**
 * Form data interface for contract editing
 */
interface ContractFormData {
  clientName: string;
  eventDate: string;
  eventVenue: string;
  servicePackage: string;
  amount: string;
  content: string;
}

/**
 * Props for the ContractEditForm component
 */
export interface ContractEditFormProps {
  /** Contract to edit */
  contract: Contract;
  /** Function called when form is submitted successfully */
  onSubmit: (contractId: string) => void;
  /** Function called when form is cancelled */
  onCancel: () => void;
  /** Function called when signing is completed */
  onSigningComplete?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Contract edit form component with signing functionality
 * Features form editing and direct signing from edit view
 */
export const ContractEditForm: React.FC<ContractEditFormProps> = ({
  contract,
  onSubmit,
  onCancel,
  onSigningComplete,
  className
}) => {
  const { updateContract, signContract, isLoading, isContractLoading, error } = useContractStore();
  const { user } = useAuthStore();
  
  const [formData, setFormData] = React.useState<ContractFormData>({
    clientName: contract.clientName,
    eventDate: contract.eventDate,
    eventVenue: contract.eventVenue,
    servicePackage: contract.servicePackage,
    amount: contract.amount.toString(),
    content: contract.content
  });

  const [errors, setErrors] = React.useState<Partial<ContractFormData>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showAIModal, setShowAIModal] = React.useState(false);
  const [showSigningWorkflow, setShowSigningWorkflow] = React.useState(false);
  const [updatedContract, setUpdatedContract] = React.useState<Contract>(contract);

  /**
   * Validates the form data
   */
  const validateForm = (): boolean => {
    const newErrors: Partial<ContractFormData> = {};

    if (!formData.clientName.trim()) {
      newErrors.clientName = 'Client name is required';
    }

    if (!formData.eventDate) {
      newErrors.eventDate = 'Event date is required';
    } else {
      const eventDate = new Date(formData.eventDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (eventDate < today) {
        newErrors.eventDate = 'Event date cannot be in the past';
      }
    }

    if (!formData.eventVenue.trim()) {
      newErrors.eventVenue = 'Event venue is required';
    }

    if (!formData.servicePackage.trim()) {
      newErrors.servicePackage = 'Service package is required';
    }

    if (!formData.amount.trim()) {
      newErrors.amount = 'Amount is required';
    } else {
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        newErrors.amount = 'Amount must be a valid positive number';
      }
    }

    if (!formData.content.trim() || formData.content === '<p></p>') {
      newErrors.content = 'Contract content is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handles form submission (save changes)
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const contractData = {
        clientName: formData.clientName.trim(),
        eventDate: formData.eventDate,
        eventVenue: formData.eventVenue.trim(),
        servicePackage: formData.servicePackage.trim(),
        amount: parseFloat(formData.amount),
        content: formData.content
      };

      const success = await updateContract(contract.id, contractData);
      if (success) {
        // Update the local contract state with new data
        setUpdatedContract({
          ...contract,
          ...contractData
        });
        onSubmit(contract.id);
      } else {
        throw new Error('Failed to update contract');
      }
    } catch (error) {
      console.error('Error updating contract:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handles input changes
   */
  const handleInputChange = (field: keyof ContractFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  /**
   * Handles AI assistance modal opening
   */
  const handleAIAssist = () => {
    // Check if we have minimum required data for AI generation
    if (!formData.clientName.trim() || !formData.eventDate || !formData.eventVenue.trim()) {
      // Set errors for missing required fields
      const newErrors: Partial<ContractFormData> = {};
      if (!formData.clientName.trim()) newErrors.clientName = 'Client name is required for AI assistance';
      if (!formData.eventDate) newErrors.eventDate = 'Event date is required for AI assistance';
      if (!formData.eventVenue.trim()) newErrors.eventVenue = 'Event venue is required for AI assistance';
      setErrors(newErrors);
      return;
    }

    setShowAIModal(true);
  };

  /**
   * Handles accepting AI-generated content
   */
  const handleAIContentAccept = (content: string) => {
    handleInputChange('content', content);
    setShowAIModal(false);
  };

  /**
   * Handles signing workflow
   */
  const handleSign = async () => {
    // First save any changes
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const contractData = {
        clientName: formData.clientName.trim(),
        eventDate: formData.eventDate,
        eventVenue: formData.eventVenue.trim(),
        servicePackage: formData.servicePackage.trim(),
        amount: parseFloat(formData.amount),
        content: formData.content
      };

      const success = await updateContract(contract.id, contractData);
      if (success) {
        // Update the local contract state with new data
        const newContract = {
          ...contract,
          ...contractData
        };
        setUpdatedContract(newContract);
        setShowSigningWorkflow(true);
      } else {
        throw new Error('Failed to update contract');
      }
    } catch (error) {
      console.error('Error updating contract:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handles signature confirmation
   */
  const handleSignatureConfirm = async (signature: SignatureData) => {
    await signContract(contract.id, signature);
    setShowSigningWorkflow(false);
    onSigningComplete?.();
  };

  /**
   * Handles signing workflow cancellation
   */
  const handleSigningCancel = () => {
    setShowSigningWorkflow(false);
  };

  if (showSigningWorkflow) {
    return (
      <ContractSigningWorkflow
        contract={updatedContract}
        loading={isContractLoading}
        onSignatureConfirm={handleSignatureConfirm}
        onCancel={handleSigningCancel}
        onComplete={onSigningComplete}
      />
    );
  }

  return (
    <div className={cn('max-w-4xl mx-auto', className)}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Edit Contract</h1>
            <p className="text-muted-foreground">Update contract details for {contract.clientName}</p>
          </div>
          
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              leftIcon={<X className="w-4 h-4" />}
            >
              Cancel
            </Button>
            
            <Button
              type="submit"
              loading={isSubmitting}
              leftIcon={<Save className="w-4 h-4" />}
              variant="outline"
            >
              Save Changes
            </Button>

            <Button
              type="button"
              onClick={handleSign}
              loading={isSubmitting}
              leftIcon={<PenTool className="w-4 h-4" />}
            >
              Save & Sign
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-destructive/10 border border-destructive/50 rounded-lg"
          >
            <p className="text-destructive">{error}</p>
          </motion.div>
        )}

        {/* Form Fields */}
        <div className="bg-card border rounded-lg p-6 space-y-6">
          {/* Client Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Client Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Client Name"
                value={formData.clientName}
                onChange={(e) => handleInputChange('clientName', e.target.value)}
                error={errors.clientName}
                placeholder="Enter client name"
                required
              />

              <Input
                label="Event Date"
                type="date"
                value={formData.eventDate}
                onChange={(e) => handleInputChange('eventDate', e.target.value)}
                error={errors.eventDate}
                required
              />
            </div>

            <Input
              label="Event Venue"
              value={formData.eventVenue}
              onChange={(e) => handleInputChange('eventVenue', e.target.value)}
              error={errors.eventVenue}
              placeholder="Enter event venue"
              required
            />
          </div>

          {/* Service Details */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Service Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Service Package"
                value={formData.servicePackage}
                onChange={(e) => handleInputChange('servicePackage', e.target.value)}
                error={errors.servicePackage}
                placeholder="Describe the service package"
                required
              />

              <Input
                label="Amount ($)"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                error={errors.amount}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          {/* Contract Content */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Contract Terms</h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAIAssist}
                className="text-sm"
              >
                ✨ AI Assist
              </Button>
            </div>
            
            <RichTextEditor
              content={formData.content}
              onChange={(content) => handleInputChange('content', content)}
              placeholder="Enter contract terms and conditions..."
              error={errors.content}
            />
          </div>
        </div>

        {/* AI Assist Modal */}
        <AIAssistModal
          isOpen={showAIModal}
          onClose={() => setShowAIModal(false)}
          onAccept={handleAIContentAccept}
          contractData={{
            clientName: formData.clientName,
            eventDate: formData.eventDate,
            eventVenue: formData.eventVenue,
            servicePackage: formData.servicePackage,
            amount: parseFloat(formData.amount) || 0
          }}
          currentContent={formData.content}
        />
      </form>
    </div>
  );
};