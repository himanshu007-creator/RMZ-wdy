import { create } from 'zustand';
import { Contract, SignatureData, ApiResponse } from '@/types';
import { API_ENDPOINTS } from '@/lib/constants';

/**
 * Contract store state interface
 */
interface ContractState {
  /** Array of all contracts for the current user */
  contracts: Contract[];
  /** Currently selected/active contract */
  currentContract: Contract | null;
  /** Loading state for contract operations */
  isLoading: boolean;
  /** Loading state for individual contract operations */
  isContractLoading: boolean;
  /** Current error message, if any */
  error: string | null;
  /** Filter for contract status */
  statusFilter: 'all' | 'draft' | 'signed';
  /** Search query for filtering contracts */
  searchQuery: string;
}

/**
 * Contract store actions interface
 */
interface ContractActions {
  /**
   * Fetches all contracts for the authenticated user
   */
  fetchContracts: () => Promise<void>;
  
  /**
   * Fetches a specific contract by ID
   * @param contractId - ID of the contract to fetch
   */
  fetchContract: (contractId: string) => Promise<Contract | null>;
  
  /**
   * Creates a new contract
   * @param contractData - Contract data for creation
   * @returns Promise resolving to the created contract ID
   */
  createContract: (contractData: {
    clientName: string;
    eventDate: string;
    eventVenue: string;
    servicePackage: string;
    amount: number;
    content: string;
  }) => Promise<string | null>;
  
  /**
   * Updates an existing contract
   * @param contractId - ID of the contract to update
   * @param updates - Partial contract data to update
   */
  updateContract: (contractId: string, updates: Partial<Contract>) => Promise<boolean>;
  
  /**
   * Deletes a contract
   * @param contractId - ID of the contract to delete
   */
  deleteContract: (contractId: string) => Promise<boolean>;
  
  /**
   * Signs a contract with digital signature
   * @param contractId - ID of the contract to sign
   * @param signature - Signature data
   */
  signContract: (contractId: string, signature: SignatureData) => Promise<boolean>;
  
  /**
   * Sets the current contract
   * @param contract - Contract to set as current
   */
  setCurrentContract: (contract: Contract | null) => void;
  
  /**
   * Sets the status filter for contract list
   * @param filter - Status filter to apply
   */
  setStatusFilter: (filter: 'all' | 'draft' | 'signed') => void;
  
  /**
   * Sets the search query for filtering contracts
   * @param query - Search query string
   */
  setSearchQuery: (query: string) => void;
  
  /**
   * Gets filtered contracts based on current filters
   * @returns Filtered array of contracts
   */
  getFilteredContracts: () => Contract[];
  
  /**
   * Clears any current error message
   */
  clearError: () => void;
  
  /**
   * Resets the store to initial state
   */
  reset: () => void;
}

/**
 * Combined contract store interface
 */
type ContractStore = ContractState & ContractActions;

/**
 * Initial state for the contract store
 */
const initialState: ContractState = {
  contracts: [],
  currentContract: null,
  isLoading: false,
  isContractLoading: false,
  error: null,
  statusFilter: 'all',
  searchQuery: ''
};

/**
 * Zustand store for contract state management
 * Handles contract CRUD operations, filtering, and state management
 */
export const useContractStore = create<ContractStore>((set, get) => ({
  // Initial state
  ...initialState,

  /**
   * Fetches all contracts for the authenticated user
   */
  fetchContracts: async (): Promise<void> => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(API_ENDPOINTS.CONTRACTS);
      const result: ApiResponse<Contract[]> = await response.json();

      if (result.success && result.data) {
        set({
          contracts: result.data,
          isLoading: false,
          error: null
        });
      } else {
        set({
          error: result.error || 'Failed to fetch contracts',
          isLoading: false
        });
      }
    } catch (error) {
      set({
        error: 'Network error. Please try again.',
        isLoading: false
      });
    }
  },

  /**
   * Fetches a specific contract by ID
   */
  fetchContract: async (contractId: string): Promise<Contract | null> => {
    set({ isContractLoading: true, error: null });

    try {
      const response = await fetch(`${API_ENDPOINTS.CONTRACTS}/${contractId}`);
      const result: ApiResponse<Contract> = await response.json();

      if (result.success && result.data) {
        set({
          currentContract: result.data,
          isContractLoading: false,
          error: null
        });
        return result.data;
      } else {
        set({
          error: result.error || 'Failed to fetch contract',
          isContractLoading: false
        });
        return null;
      }
    } catch (error) {
      set({
        error: 'Network error. Please try again.',
        isContractLoading: false
      });
      return null;
    }
  },

  /**
   * Creates a new contract
   */
  createContract: async (contractData): Promise<string | null> => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(API_ENDPOINTS.CONTRACTS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(contractData)
      });

      const result: ApiResponse<{ id: string }> = await response.json();

      if (result.success && result.data) {
        // Refresh contracts list
        await get().fetchContracts();
        set({ isLoading: false });
        return result.data.id;
      } else {
        set({
          error: result.error || 'Failed to create contract',
          isLoading: false
        });
        return null;
      }
    } catch (error) {
      set({
        error: 'Network error. Please try again.',
        isLoading: false
      });
      return null;
    }
  },

  /**
   * Updates an existing contract
   */
  updateContract: async (contractId: string, updates: Partial<Contract>): Promise<boolean> => {
    set({ isContractLoading: true, error: null });

    try {
      const response = await fetch(`${API_ENDPOINTS.CONTRACTS}/${contractId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      const result: ApiResponse = await response.json();

      if (result.success) {
        // Update local state
        const { contracts, currentContract } = get();
        const updatedContracts = contracts.map(contract =>
          contract.id === contractId ? { ...contract, ...updates } : contract
        );
        
        set({
          contracts: updatedContracts,
          currentContract: currentContract?.id === contractId 
            ? { ...currentContract, ...updates } 
            : currentContract,
          isContractLoading: false,
          error: null
        });
        return true;
      } else {
        set({
          error: result.error || 'Failed to update contract',
          isContractLoading: false
        });
        return false;
      }
    } catch (error) {
      set({
        error: 'Network error. Please try again.',
        isContractLoading: false
      });
      return false;
    }
  },

  /**
   * Deletes a contract
   */
  deleteContract: async (contractId: string): Promise<boolean> => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(`${API_ENDPOINTS.CONTRACTS}/${contractId}`, {
        method: 'DELETE'
      });

      const result: ApiResponse = await response.json();

      if (result.success) {
        // Remove from local state
        const { contracts, currentContract } = get();
        const updatedContracts = contracts.filter(contract => contract.id !== contractId);
        
        set({
          contracts: updatedContracts,
          currentContract: currentContract?.id === contractId ? null : currentContract,
          isLoading: false,
          error: null
        });
        return true;
      } else {
        set({
          error: result.error || 'Failed to delete contract',
          isLoading: false
        });
        return false;
      }
    } catch (error) {
      set({
        error: 'Network error. Please try again.',
        isLoading: false
      });
      return false;
    }
  },

  /**
   * Signs a contract with digital signature
   */
  signContract: async (contractId: string, signature: SignatureData): Promise<boolean> => {
    set({ isContractLoading: true, error: null });

    try {
      const response = await fetch(`${API_ENDPOINTS.CONTRACTS}/${contractId}/sign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(signature)
      });

      const result: ApiResponse = await response.json();

      if (result.success) {
        // Update local state
        const { contracts, currentContract } = get();
        const updatedContracts = contracts.map(contract =>
          contract.id === contractId 
            ? { ...contract, signature, status: 'signed' as const }
            : contract
        );
        
        set({
          contracts: updatedContracts,
          currentContract: currentContract?.id === contractId 
            ? { ...currentContract, signature, status: 'signed' as const }
            : currentContract,
          isContractLoading: false,
          error: null
        });
        return true;
      } else {
        set({
          error: result.error || 'Failed to sign contract',
          isContractLoading: false
        });
        return false;
      }
    } catch (error) {
      set({
        error: 'Network error. Please try again.',
        isContractLoading: false
      });
      return false;
    }
  },

  /**
   * Sets the current contract
   */
  setCurrentContract: (contract: Contract | null): void => {
    set({ currentContract: contract });
  },

  /**
   * Sets the status filter for contract list
   */
  setStatusFilter: (filter: 'all' | 'draft' | 'signed'): void => {
    set({ statusFilter: filter });
  },

  /**
   * Sets the search query for filtering contracts
   */
  setSearchQuery: (query: string): void => {
    set({ searchQuery: query });
  },

  /**
   * Gets filtered contracts based on current filters
   */
  getFilteredContracts: (): Contract[] => {
    const { contracts, statusFilter, searchQuery } = get();
    
    let filtered = contracts;

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(contract => contract.status === statusFilter);
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(contract =>
        contract.clientName.toLowerCase().includes(query) ||
        contract.eventVenue.toLowerCase().includes(query) ||
        contract.servicePackage.toLowerCase().includes(query)
      );
    }

    return filtered;
  },

  /**
   * Clears the current error message
   */
  clearError: (): void => {
    set({ error: null });
  },

  /**
   * Resets the store to initial state
   */
  reset: (): void => {
    set(initialState);
  }
}));