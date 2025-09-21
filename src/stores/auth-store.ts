import { create } from 'zustand';
import { User, LoginCredentials, ApiResponse } from '@/types';
import { API_ENDPOINTS } from '@/lib/constants';

/**
 * Authentication store state interface
 */
interface AuthState {
  /** Currently authenticated user, null if not logged in */
  user: User | null;
  /** Whether user is currently authenticated */
  isAuthenticated: boolean;
  /** Loading state for authentication operations */
  isLoading: boolean;
  /** Current error message, if any */
  error: string | null;
}

/**
 * Authentication store actions interface
 */
interface AuthActions {
  /**
   * Authenticates user with email and password
   * @param credentials - User login credentials
   * @returns Promise resolving to success status
   */
  login: (credentials: LoginCredentials) => Promise<boolean>;
  
  /**
   * Logs out the current user and clears session
   */
  logout: () => Promise<void>;
  
  /**
   * Initializes auth state by checking for existing session
   */
  initializeAuth: () => Promise<void>;
  
  /**
   * Clears any current error message
   */
  clearError: () => void;
}

/**
 * Combined auth store interface
 */
type AuthStore = AuthState & AuthActions;

/**
 * Zustand store for authentication state management
 * Handles user login, logout, session management, and auth state
 */
export const useAuthStore = create<AuthStore>((set, get) => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  /**
   * Authenticates user with provided credentials
   */
  login: async (credentials: LoginCredentials): Promise<boolean> => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(`${API_ENDPOINTS.AUTH}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const result: ApiResponse<User> = await response.json();

      if (result.success && result.data) {
        set({
          user: result.data,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return true;
      } else {
        set({
          error: result.error || 'Login failed',
          isLoading: false,
        });
        return false;
      }
    } catch (error) {
      set({
        error: 'Network error. Please try again.',
        isLoading: false,
      });
      return false;
    }
  },

  /**
   * Logs out the current user
   */
  logout: async (): Promise<void> => {
    set({ isLoading: true });

    try {
      await fetch(`${API_ENDPOINTS.AUTH}/logout`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  /**
   * Initializes authentication state by checking for existing session
   */
  initializeAuth: async (): Promise<void> => {
    set({ isLoading: true });

    try {
      const response = await fetch(`${API_ENDPOINTS.AUTH}/me`);
      const result: ApiResponse<User> = await response.json();

      if (result.success && result.data) {
        set({
          user: result.data,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  /**
   * Clears the current error message
   */
  clearError: (): void => {
    set({ error: null });
  },
}));