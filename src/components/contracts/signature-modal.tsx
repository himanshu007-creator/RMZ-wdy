import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PenTool, Type, RotateCcw, Check, X } from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SignatureData } from '@/types';
import { cn } from '@/lib/utils';
import { createSignatureData, optimizeSignatureImage } from '@/lib/signature-utils';

/**
 * Props for the SignatureModal component
 */
export interface SignatureModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Function to call when the modal should be closed */
  onClose: () => void;
  /** Function to call when signature is confirmed */
  onConfirm: (signature: SignatureData) => void;
  /** Whether the signature is being saved */
  loading?: boolean;
}

/**
 * Modal component for capturing digital signatures
 * Supports both drawing with mouse/touch and typing signatures
 * Optimized for mobile touch interactions with responsive design
 */
export const SignatureModal: React.FC<SignatureModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  loading = false
}) => {
  const [signatureType, setSignatureType] = useState<'drawn' | 'typed'>('drawn');
  const [typedSignature, setTypedSignature] = useState('');
  const [hasDrawnSignature, setHasDrawnSignature] = useState(false);
  
  const signatureCanvasRef = useRef<SignatureCanvas>(null);

  /**
   * Resets the modal state when opened/closed
   */
  useEffect(() => {
    if (isOpen) {
      setSignatureType('drawn');
      setTypedSignature('');
      setHasDrawnSignature(false);
      if (signatureCanvasRef.current) {
        signatureCanvasRef.current.clear();
      }
    }
  }, [isOpen]);

  /**
   * Handles signature canvas drawing events
   */
  const handleCanvasChange = () => {
    if (signatureCanvasRef.current && !signatureCanvasRef.current.isEmpty()) {
      setHasDrawnSignature(true);
    } else {
      setHasDrawnSignature(false);
    }
  };

  /**
   * Clears the signature canvas
   */
  const handleClearCanvas = () => {
    if (signatureCanvasRef.current) {
      signatureCanvasRef.current.clear();
      setHasDrawnSignature(false);
    }
  };

  /**
   * Handles signature confirmation
   */
  const handleConfirm = async () => {
    if (signatureType === 'drawn') {
      if (!signatureCanvasRef.current || signatureCanvasRef.current.isEmpty()) {
        return;
      }
      
      const rawImageData = signatureCanvasRef.current.toDataURL('image/png');
      // Optimize the image for better storage and performance
      const optimizedImageData = await optimizeSignatureImage(rawImageData, 400);
      const signatureData = createSignatureData('drawn', optimizedImageData);
      
      onConfirm(signatureData);
    } else {
      if (!typedSignature.trim()) {
        return;
      }
      
      const signatureData = createSignatureData('typed', typedSignature.trim());
      onConfirm(signatureData);
    }
  };

  /**
   * Checks if the current signature is valid
   */
  const isSignatureValid = () => {
    if (signatureType === 'drawn') {
      return hasDrawnSignature;
    } else {
      return typedSignature.trim().length > 0;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Sign Contract"
      size="lg"
      className="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Signature Type Selector */}
        <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
          <button
            onClick={() => setSignatureType('drawn')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors',
              signatureType === 'drawn'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            <PenTool className="w-4 h-4" />
            Draw Signature
          </button>
          
          <button
            onClick={() => setSignatureType('typed')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors',
              signatureType === 'typed'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            <Type className="w-4 h-4" />
            Type Signature
          </button>
        </div>

        {/* Signature Input Area */}
        <div className="space-y-4">
          {signatureType === 'drawn' ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Draw your signature in the box below:
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearCanvas}
                  leftIcon={<RotateCcw className="w-4 h-4" />}
                  disabled={!hasDrawnSignature}
                >
                  Clear
                </Button>
              </div>
              
              <div className="relative">
                <div className="border-2 border-dashed border-gray-300 rounded-lg bg-white overflow-hidden">
                  <SignatureCanvas
                    ref={signatureCanvasRef}
                    canvasProps={{
                      className: 'w-full h-40 touch-action-none',
                      style: { 
                        width: '100%', 
                        height: '160px',
                        touchAction: 'none'
                      }
                    }}
                    backgroundColor="white"
                    penColor="black"
                    minWidth={0.5}
                    maxWidth={2.5}
                    velocityFilterWeight={0.7}
                    throttle={16}
                    onEnd={handleCanvasChange}
                    onBegin={() => {}}
                  />
                </div>
                
                {!hasDrawnSignature && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <p className="text-gray-400 text-sm">
                      Sign here with your mouse or finger
                    </p>
                  </div>
                )}
              </div>
              
              <p className="text-xs text-gray-500">
                Use your mouse or finger to draw your signature. Works on touch devices.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Type your full name as it should appear on the contract:
              </p>
              
              <Input
                type="text"
                placeholder="Enter your full name"
                value={typedSignature}
                onChange={(e) => setTypedSignature(e.target.value)}
                className="text-lg"
                autoFocus
              />
              
              {typedSignature && (
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <p className="text-sm text-gray-600 mb-2">Preview:</p>
                  <div 
                    className="text-2xl text-gray-900 py-2"
                    style={{ 
                      fontFamily: 'cursive',
                      fontStyle: 'italic'
                    }}
                  >
                    {typedSignature}
                  </div>
                </div>
              )}
              
              <p className="text-xs text-gray-500">
                Your typed name will be displayed in a signature-style font.
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            leftIcon={<X className="w-4 h-4" />}
            className="flex-1"
          >
            Cancel
          </Button>
          
          <Button
            onClick={handleConfirm}
            disabled={!isSignatureValid() || loading}
            loading={loading}
            leftIcon={<Check className="w-4 h-4" />}
            className="flex-1"
          >
            {loading ? 'Signing...' : 'Sign Contract'}
          </Button>
        </div>

        {/* Legal Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-800">
            By signing this contract, you agree to be legally bound by its terms and conditions. 
            Your digital signature has the same legal effect as a handwritten signature.
          </p>
        </div>
      </div>
    </Modal>
  );
};