import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, RefreshCw, AlertCircle, CheckCircle, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { generateAIContent, AIContentRequest, AIContentResponse } from '@/lib/ai-service';
import { useAuthStore } from '@/stores/auth-store';
import { cn } from '@/lib/utils';

/**
 * Props for the AIAssistModal component
 */
export interface AIAssistModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Function called when modal should close */
  onClose: () => void;
  /** Function called when content is accepted */
  onAccept: (content: string) => void;
  /** Contract details for AI generation */
  contractData: {
    clientName: string;
    eventDate: string;
    eventVenue: string;
    servicePackage: string;
    amount: number;
  };
  /** Current contract content */
  currentContent?: string;
}

/**
 * AI Assist modal component with content generation and editing capabilities
 * Features mobile-optimized UI, loading animations, and fallback handling
 */
export const AIAssistModal: React.FC<AIAssistModalProps> = ({
  isOpen,
  onClose,
  onAccept,
  contractData,
  currentContent = ''
}) => {
  const { user } = useAuthStore();
  const [generatedContent, setGeneratedContent] = React.useState<string>('');
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isFallback, setIsFallback] = React.useState(false);
  const [hasGenerated, setHasGenerated] = React.useState(false);

  /**
   * Generates AI content based on contract data
   */
  const handleGenerate = async () => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setIsFallback(false);

    try {
      const request: AIContentRequest = {
        vendorType: user.vendorType,
        vendorName: user.name,
        clientName: contractData.clientName,
        eventDate: contractData.eventDate,
        eventVenue: contractData.eventVenue,
        servicePackage: contractData.servicePackage,
        amount: contractData.amount
      };

      const response: AIContentResponse = await generateAIContent(request);

      if (response.success && response.content) {
        setGeneratedContent(response.content);
        setIsFallback(response.isFallback || false);
        setHasGenerated(true);
      } else {
        setError(response.error || 'Failed to generate content');
      }
    } catch (err) {
      console.error('AI generation error:', err);
      setError('Failed to generate content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Handles content regeneration
   */
  const handleRegenerate = () => {
    handleGenerate();
  };

  /**
   * Handles accepting the generated content
   */
  const handleAccept = () => {
    if (generatedContent.trim()) {
      onAccept(generatedContent);
      onClose();
    }
  };

  /**
   * Handles copying content to clipboard
   */
  const handleCopy = async () => {
    if (generatedContent) {
      try {
        await navigator.clipboard.writeText(generatedContent);
        // Could add a toast notification here
      } catch (err) {
        console.error('Failed to copy content:', err);
      }
    }
  };

  /**
   * Resets modal state when closed
   */
  React.useEffect(() => {
    if (!isOpen) {
      setGeneratedContent('');
      setError(null);
      setIsFallback(false);
      setHasGenerated(false);
    }
  }, [isOpen]);

  /**
   * Auto-generate content when modal opens if we have all required data
   */
  React.useEffect(() => {
    if (isOpen && !hasGenerated && contractData.clientName && contractData.eventDate && contractData.eventVenue) {
      handleGenerate();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, hasGenerated, contractData]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="flex flex-col h-full max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Sparkles className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">AI Contract Assistant</h2>
              <p className="text-sm text-gray-600">
                Generate professional contract content for {user?.vendorType}s
              </p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <div className="p-6 space-y-6 h-full overflow-y-auto">
            {/* Contract Details Summary */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <h3 className="font-medium text-gray-900">Contract Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                <div><span className="font-medium">Client:</span> {contractData.clientName}</div>
                <div><span className="font-medium">Date:</span> {new Date(contractData.eventDate).toLocaleDateString()}</div>
                <div><span className="font-medium">Venue:</span> {contractData.eventVenue}</div>
                <div><span className="font-medium">Package:</span> {contractData.servicePackage}</div>
                <div className="sm:col-span-2">
                  <span className="font-medium">Amount:</span> {contractData.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                </div>
              </div>
            </div>

            {/* Generation Controls */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={hasGenerated ? handleRegenerate : handleGenerate}
                loading={isGenerating}
                leftIcon={hasGenerated ? <RefreshCw className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                className="flex-1 sm:flex-none"
              >
                {isGenerating ? 'Generating...' : hasGenerated ? 'Regenerate' : 'Generate Content'}
              </Button>

              {generatedContent && (
                <Button
                  variant="outline"
                  onClick={handleCopy}
                  leftIcon={<Copy className="w-4 h-4" />}
                  className="flex-1 sm:flex-none"
                >
                  Copy
                </Button>
              )}
            </div>

            {/* Status Messages */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </motion.div>
              )}

              {isFallback && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">
                    AI service unavailable. Using template-based content.
                  </span>
                </motion.div>
              )}

              {generatedContent && !error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800"
                >
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">
                    Content generated successfully! Review and edit as needed.
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Generated Content Editor */}
            {generatedContent && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <h3 className="font-medium text-gray-900">Generated Contract Content</h3>
                <div className="border border-gray-200 rounded-lg">
                  <RichTextEditor
                    content={generatedContent}
                    onChange={setGeneratedContent}
                    placeholder="Generated content will appear here..."
                    minHeight="400px"
                  />
                </div>
              </motion.div>
            )}

            {/* Loading State */}
            {isGenerating && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12 space-y-4"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-8 h-8 text-purple-600" />
                </motion.div>
                <div className="text-center">
                  <p className="font-medium text-gray-900">Generating your contract...</p>
                  <p className="text-sm text-gray-600">This may take a few moments</p>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row gap-3 p-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 sm:flex-none order-2 sm:order-1"
          >
            Cancel
          </Button>
          
          <Button
            onClick={handleAccept}
            disabled={!generatedContent.trim()}
            className="flex-1 sm:flex-none order-1 sm:order-2"
          >
            Use This Content
          </Button>
        </div>
      </div>
    </Modal>
  );
};