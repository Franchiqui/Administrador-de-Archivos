'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'user' | 'admin';
  storageUsed: number;
  storageLimit: number;
  createdAt: Date;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  clearError: () => void;
  initialize: () => Promise<void>;
}

const initialAuthState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      ...initialAuthState,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulación de API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Validación básica
          if (!email || !password) {
            throw new Error('Email y contraseña son requeridos');
          }
          
          // Mock de respuesta exitosa
          const mockUser: User = {
            id: 'user_123',
            email,
            name: email.split('@')[0],
            role: 'user',
            storageUsed: 2147483648, // 2GB
            storageLimit: 10737418240, // 10GB
            createdAt: new Date(),
          };
          
          const mockToken = 'mock_jwt_token_123';
          
          set({
            user: mockUser,
            token: mockToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Error al iniciar sesión',
          });
          throw error;
        }
      },

      register: async (name: string, email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulación de API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Validación básica
          if (!name || !email || !password) {
            throw new Error('Todos los campos son requeridos');
          }
          
          if (password.length < 6) {
            throw new Error('La contraseña debe tener al menos 6 caracteres');
          }
          
          // Mock de respuesta exitosa
          const mockUser: User = {
            id: 'user_' + Date.now(),
            email,
            name,
            role: 'user',
            storageUsed: 0,
            storageLimit: 10737418240, // 10GB
            createdAt: new Date(),
          };
          
          const mockToken = 'mock_jwt_token_' + Date.now();
          
          set({
            user: mockUser,
            token: mockToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Error al registrarse',
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        
        try {
          // Simulación de API call para logout
          await new Promise(resolve => setTimeout(resolve, 500));
          
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
          
        } catch (error) {
          // Aún así limpiamos el estado local
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      updateUser: (userData: Partial<User>) => {
        const { user } = get();
        if (user) {
          set({
            user: { ...user, ...userData },
          });
        }
      },

      clearError: () => {
        set({ error: null });
      },

      initialize: async () => {
        const { token } = get();
        
        if (!token) {
          return;
        }
        
        set({ isLoading: true });
        
        try {
          // Simulación de verificación de token
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Mock de usuario recuperado del token
          const mockUser: User = {
            id: 'user_123',
            email: 'usuario@ejemplo.com',
            name: 'Usuario Demo',
            role: 'user',
            storageUsed: 2147483648, // 2GB
            storageLimit: 10737418240, // 10GB
            createdAt: new Date('2024-01-01'),
          };
          
          set({
            user: mockUser,
            isAuthenticated: true,
            isLoading: false,
          });
          
        } catch (error) {
          // Token inválido, limpiamos el estado
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Hook helper para acceso rápido al estado de autenticación
export const useAuth = () => {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  
  return {
    user,
    isAuthenticated,
    isLoading,
    isAdmin: user?.role === 'admin',
    storagePercentage: user 
      ? Math.round((user.storageUsed / user.storageLimit) * 100)
      : 0,
  };
};
