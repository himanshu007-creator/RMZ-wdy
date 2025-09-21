/**
 * Application-wide constants
 */

/** Supported vendor types in the system */
export const VENDOR_TYPES = ['photographer', 'caterer', 'florist'] as const;

/** Contract status options */
export const CONTRACT_STATUS = ['draft', 'signed', 'deleted'] as const;

/** Signature types available */
export const SIGNATURE_TYPES = ['drawn', 'typed'] as const;

/** Contract generation settings */
export const CONTRACT_SETTINGS = {
  DEFAULT_DEPOSIT_PERCENTAGE: 0.5,
  DEFAULT_BALANCE_DUE_DAYS: 30,
  DEFAULT_CANCELLATION_NOTICE_DAYS: 30
} as const;

/** API endpoints */
export const API_ENDPOINTS = {
  AUTH: '/api/auth',
  CONTRACTS: '/api/contracts',
  AI_ASSIST: '/api/ai-assist'
} as const;

/** Local storage keys */
export const STORAGE_KEYS = {
  USER_SESSION: 'wedding_vendor_user_session'
} as const;

/** Form validation messages */
export const VALIDATION_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_DATE: 'Please enter a valid date',
  INVALID_AMOUNT: 'Please enter a valid amount'
} as const;