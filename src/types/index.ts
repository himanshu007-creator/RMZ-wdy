/**
 * Represents a user in the wedding vendor contract system
 */
export interface User {
  /** Unique identifier for the user */
  id: string;
  /** User's email address used for authentication */
  email: string;
  /** Type of wedding vendor (photographer, caterer, or florist) */
  vendorType: 'photographer' | 'caterer' | 'florist';
  /** Display name of the user */
  name: string;
}

/**
 * Represents signature data for digital contract signing
 */
export interface SignatureData {
  /** Type of signature - either drawn with mouse/touch or typed */
  type: 'drawn' | 'typed';
  /** Signature data - Base64 image for drawn signatures, text for typed signatures */
  data: string;
  /** ISO timestamp when the signature was created */
  timestamp: string;
}

/**
 * Represents a contract in the system
 */
export interface Contract {
  /** Unique identifier for the contract */
  id: string;
  /** ID of the vendor who owns this contract */
  vendorId: string;
  /** Name of the client for this contract */
  clientName: string;
  /** Date of the wedding event (ISO date string) */
  eventDate: string;
  /** Venue where the wedding event will take place */
  eventVenue: string;
  /** Description of the service package being provided */
  servicePackage: string;
  /** Contract amount in dollars */
  amount: number;
  /** Rich text content of the contract */
  content: string;
  /** Current status of the contract */
  status: 'draft' | 'signed' | 'deleted';
  /** Digital signature data if the contract has been signed */
  signature?: SignatureData;
  /** ISO timestamp when the contract was created */
  createdAt: string;
  /** ISO timestamp when the contract was last updated */
  updatedAt: string;
}

/**
 * Authentication credentials for login
 */
export interface LoginCredentials {
  /** User's email address */
  email: string;
  /** User's password */
  password: string;
}

/**
 * API response wrapper for consistent error handling
 */
export interface ApiResponse<T = any> {
  /** Whether the request was successful */
  success: boolean;
  /** Response data if successful */
  data?: T;
  /** Error message if unsuccessful */
  error?: string;
}

/**
 * API validation error response
 */
export interface ValidationErrorResponse {
  /** Whether the request was successful (always false for validation errors) */
  success: false;
  /** Error message */
  error: string;
  /** Field-specific validation errors */
  data: {
    clientName?: string;
    eventDate?: string;
    eventVenue?: string;
    servicePackage?: string;
    amount?: string;
    content?: string;
  };
}