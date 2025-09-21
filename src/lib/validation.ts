import { VALIDATION_MESSAGES } from './constants';
import { Contract } from '@/types';

/**
 * Validation result interface
 */
export interface ValidationResult {
  /** Whether the validation passed */
  isValid: boolean;
  /** Error message if validation failed */
  error?: string;
}

/**
 * Contract validation result interface
 */
export interface ContractValidationResult {
  /** Whether all fields are valid */
  isValid: boolean;
  /** Field-specific validation errors */
  errors: {
    clientName?: string;
    eventDate?: string;
    eventVenue?: string;
    servicePackage?: string;
    amount?: string;
    content?: string;
  };
}

/**
 * Validates an email address format
 * @param email - Email address to validate
 * @returns Validation result with error message if invalid
 */
export const validateEmail = (email: string): ValidationResult => {
  if (!email.trim()) {
    return { isValid: false, error: VALIDATION_MESSAGES.REQUIRED_FIELD };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: VALIDATION_MESSAGES.INVALID_EMAIL };
  }

  return { isValid: true };
};

/**
 * Validates a required field is not empty
 * @param value - Value to validate
 * @param fieldName - Name of the field for error message
 * @returns Validation result with error message if invalid
 */
export const validateRequired = (value: string, fieldName?: string): ValidationResult => {
  if (!value.trim()) {
    return { 
      isValid: false, 
      error: fieldName ? `${fieldName} is required` : VALIDATION_MESSAGES.REQUIRED_FIELD 
    };
  }

  return { isValid: true };
};

/**
 * Validates a password meets minimum requirements
 * @param password - Password to validate
 * @returns Validation result with error message if invalid
 */
export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, error: VALIDATION_MESSAGES.REQUIRED_FIELD };
  }

  if (password.length < 6) {
    return { isValid: false, error: 'Password must be at least 6 characters long' };
  }

  return { isValid: true };
};

/**
 * Validates a date string is in valid format and not in the past
 * @param dateString - Date string to validate
 * @returns Validation result with error message if invalid
 */
export const validateEventDate = (dateString: string): ValidationResult => {
  if (!dateString.trim()) {
    return { isValid: false, error: VALIDATION_MESSAGES.REQUIRED_FIELD };
  }

  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return { isValid: false, error: VALIDATION_MESSAGES.INVALID_DATE };
  }

  // Check if date is in the past (allowing same day)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date < today) {
    return { isValid: false, error: 'Event date cannot be in the past' };
  }

  return { isValid: true };
};

/**
 * Validates a monetary amount
 * @param amount - Amount to validate (can be string or number)
 * @returns Validation result with error message if invalid
 */
export const validateAmount = (amount: string | number): ValidationResult => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount) || numAmount < 0) {
    return { isValid: false, error: VALIDATION_MESSAGES.INVALID_AMOUNT };
  }

  if (numAmount === 0) {
    return { isValid: false, error: 'Amount must be greater than 0' };
  }

  return { isValid: true };
};

/**
 * Validates contract data for creation or update
 * @param contractData - Contract data to validate
 * @returns Contract validation result with field-specific errors
 */
export const validateContractData = (
  contractData: Partial<Pick<Contract, 'clientName' | 'eventDate' | 'eventVenue' | 'servicePackage' | 'amount' | 'content'>>
): ContractValidationResult => {
  const errors: ContractValidationResult['errors'] = {};

  // Validate client name
  if (contractData.clientName !== undefined) {
    const clientNameResult = validateRequired(contractData.clientName, 'Client name');
    if (!clientNameResult.isValid) {
      errors.clientName = clientNameResult.error;
    }
  }

  // Validate event date
  if (contractData.eventDate !== undefined) {
    const eventDateResult = validateEventDate(contractData.eventDate);
    if (!eventDateResult.isValid) {
      errors.eventDate = eventDateResult.error;
    }
  }

  // Validate event venue
  if (contractData.eventVenue !== undefined) {
    const eventVenueResult = validateRequired(contractData.eventVenue, 'Event venue');
    if (!eventVenueResult.isValid) {
      errors.eventVenue = eventVenueResult.error;
    }
  }

  // Validate service package
  if (contractData.servicePackage !== undefined) {
    const servicePackageResult = validateRequired(contractData.servicePackage, 'Service package');
    if (!servicePackageResult.isValid) {
      errors.servicePackage = servicePackageResult.error;
    }
  }

  // Validate amount
  if (contractData.amount !== undefined) {
    const amountResult = validateAmount(contractData.amount);
    if (!amountResult.isValid) {
      errors.amount = amountResult.error;
    }
  }

  // Validate content
  if (contractData.content !== undefined) {
    const contentResult = validateRequired(contractData.content, 'Contract content');
    if (!contentResult.isValid) {
      errors.content = contentResult.error;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validates contract data for creation (all required fields)
 * @param contractData - Contract data to validate
 * @returns Contract validation result with field-specific errors
 */
export const validateNewContract = (
  contractData: Pick<Contract, 'clientName' | 'eventDate' | 'eventVenue' | 'servicePackage' | 'amount' | 'content'>
): ContractValidationResult => {
  return validateContractData(contractData);
};

/**
 * Validates login form data
 * @param email - Email address
 * @param password - Password
 * @returns Object with validation results for each field
 */
export const validateLoginForm = (email: string, password: string) => {
  return {
    email: validateEmail(email),
    password: validatePassword(password),
    isValid: validateEmail(email).isValid && validatePassword(password).isValid
  };
};