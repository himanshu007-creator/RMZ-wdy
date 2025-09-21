import { SignatureData } from '@/types';

/**
 * Utility functions for signature handling and validation
 */

/**
 * Validates signature data
 * @param signature - Signature data to validate
 * @returns Whether the signature is valid
 */
export function validateSignature(signature: SignatureData): boolean {
  if (!signature || !signature.type || !signature.data || !signature.timestamp) {
    return false;
  }

  if (!['drawn', 'typed'].includes(signature.type)) {
    return false;
  }

  if (signature.type === 'drawn') {
    // Validate base64 image data
    return signature.data.startsWith('data:image/');
  } else {
    // Validate typed signature has content
    return signature.data.trim().length > 0;
  }
}

/**
 * Formats signature data for display
 * @param signature - Signature data to format
 * @returns Formatted signature display data
 */
export function formatSignatureForDisplay(signature: SignatureData) {
  return {
    type: signature.type,
    displayData: signature.type === 'drawn' ? signature.data : signature.data.trim(),
    timestamp: new Date(signature.timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  };
}

/**
 * Creates a new signature data object
 * @param type - Type of signature (drawn or typed)
 * @param data - Signature data (base64 image or text)
 * @returns New signature data object
 */
export function createSignatureData(type: 'drawn' | 'typed', data: string): SignatureData {
  return {
    type,
    data,
    timestamp: new Date().toISOString()
  };
}

/**
 * Checks if a signature canvas is empty (for drawn signatures)
 * @param canvasData - Base64 canvas data
 * @returns Whether the canvas appears to be empty
 */
export function isCanvasEmpty(canvasData: string): boolean {
  // Create a temporary canvas to check if it's effectively empty
  if (typeof window === 'undefined') return true;
  
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return true;

    const img = new Image();
    img.src = canvasData;
    
    // This is a simple check - in practice, you might want more sophisticated detection
    return canvasData.length < 1000; // Very small base64 strings are likely empty
  } catch {
    return true;
  }
}

/**
 * Optimizes signature image data for storage
 * @param imageData - Base64 image data
 * @param maxWidth - Maximum width for the optimized image
 * @returns Optimized base64 image data
 */
export function optimizeSignatureImage(imageData: string, maxWidth: number = 400): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      resolve(imageData);
      return;
    }

    try {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          resolve(imageData);
          return;
        }

        // Calculate new dimensions
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;

        // Draw and compress
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        resolve(canvas.toDataURL('image/png', 0.8));
      };
      
      img.onerror = () => resolve(imageData);
      img.src = imageData;
    } catch {
      resolve(imageData);
    }
  });
}