import React from 'react';
import { motion } from 'framer-motion';
import { Save, X, Sparkles } from 'lucide-react';
import { Contract } from '@/types';
import { useContractStore } from '@/stores/contract-store';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { AIAssistModal } from './ai-assist-modal';
import { cn } from '@/lib/utils';

/**
 * Form data interface for contract creation/editing
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
 * Props for the ContractForm component
 */
export interface ContractFormProps {
  /** Existing contract to edit (null for new contract) */
  contract?: Contract | null;
  /** Function called when form is submitted successfully */
  onSubmit: (contractId: string) => void;
  /** Function called when form is cancelled */
  onCancel: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Contract form component with TipTap rich text editor and mobile-optimized touch interactions
 * Features form validation, AI assistance integration, and responsive design
 */
export const ContractForm: React.FC<ContractFormProps> = ({
  contract,
  onSubmit,
  onCancel,
  className
}) => {
  const { createContract, updateContract, isLoading, error } = useContractStore();
  const { user } = useAuthStore();
  
  const [formData, setFormData] = React.useState<ContractFormData>({
    clientName: contract?.clientName || '',
    eventDate: contract?.eventDate || '',
    eventVenue: contract?.eventVenue || '',
    servicePackage: contract?.servicePackage || '',
    amount: contract?.amount?.toString() || '',
    content: contract?.content || ''
  });

  const [errors, setErrors] = React.useState<Partial<ContractFormData>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showAIModal, setShowAIModal] = React.useState(false);

  const isEditing = Boolean(contract);

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
   * Handles form submission
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

      let contractId: string;

      if (isEditing && contract) {
        const success = await updateContract(contract.id, contractData);
        if (success) {
          contractId = contract.id;
        } else {
          throw new Error('Failed to update contract');
        }
      } else {
        const newContractId = await createContract(contractData);
        if (newContractId) {
          contractId = newContractId;
        } else {
          throw new Error('Failed to create contract');
        }
      }

      onSubmit(contractId);
    } catch (error) {
      console.error('Error saving contract:', error);
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

  return (
    <div className={cn('max-w-4xl mx-auto', className)}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Edit Contract' : 'Create New Contract'}
            </h1>
            <p className="text-gray-600">
              {isEditing ? 'Update contract details' : 'Fill in the contract information'}
            </p>
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
            >
              {isEditing ? 'Update' : 'Create'} Contract
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-50 border border-red-200 rounded-lg"
          >
            <p className="text-red-800">{error}</p>
          </motion.div>
        )}

        {/* Form Fields */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
          {/* Client Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Client Information</h2>
            
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

          {/* Service Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Service Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Service Package"
                value={formData.servicePackage}
                onChange={(e) => handleInputChange('servicePackage', e.target.value)}
                error={errors.servicePackage}
                placeholder="e.g., Premium Wedding Photography"
                required
              />
              
              <Input
                label="Amount ($)"
                type="number"
                min="0"
                step="0.01"
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
              <h2 className="text-lg font-semibold text-gray-900">Contract Content</h2>
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAIAssist}
                leftIcon={<Sparkles className="w-4 h-4" />}
                className="text-purple-600 border-purple-200 hover:bg-purple-50"
                disabled={!user}
              >
                AI Assist
              </Button>
            </div>
            
            <RichTextEditor
              content={formData.content}
              onChange={(content) => handleInputChange('content', content)}
              error={errors.content}
              placeholder="Enter contract terms and conditions..."
              minHeight="300px"
            />
          </div>
        </div>

        {/* Mobile Submit Button */}
        <div className="sm:hidden">
          <Button
            type="submit"
            loading={isSubmitting}
            leftIcon={<Save className="w-4 h-4" />}
            className="w-full"
          >
            {isEditing ? 'Update' : 'Create'} Contract
          </Button>
        </div>
      </form>

      {/* AI Assist Modal */}
      <AIAssistModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        onAccept={handleAIContentAccept}
        contractData={{
          clientName: formData.clientName,
          eventDate: formData.eventDate,
          eventVenue: formData.eventVenue,
          servicePackage: formData.servicePackage || 'Standard Package',
          amount: parseFloat(formData.amount) || 0
        }}
        currentContent={formData.content}
      />
    </div>
  );
};