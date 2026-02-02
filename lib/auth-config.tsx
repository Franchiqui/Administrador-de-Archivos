'use client';

import { type AuthStatusPaths } from '@/components/auth/auth-status';

export interface AuthConfig {
  /** Rutas de autenticación */
  paths: AuthStatusPaths;
  /** Configuración de sesión */
  session: {
    /** Tiempo de expiración de la sesión en segundos */
    maxAge: number;
    /** Actualizar sesión automáticamente */
    updateAge: number;
  };
  /** Proveedores OAuth habilitados */
  providers: {
    google: boolean;
    github: boolean;
    credentials: boolean;
  };
  /** Configuración de páginas de autenticación */
  pages: {
    signIn: string;
    signUp: string;
    error: string;
    verifyRequest: string;
    newUser: string;
  };
}

/**
 * Rutas predeterminadas para la autenticación
 * Estas rutas son utilizadas por los componentes de autenticación
 */
export const authPaths: AuthStatusPaths = {
  home: '/',
  login: '/auth/login',
  register: '/auth/register',
  profile: '/dashboard/profile',
  settings: '/dashboard/settings',
  logout: '/api/auth/signout',
};

/**
 * Configuración principal de autenticación
 * Puede ser extendida o sobrescrita según las necesidades del proyecto
 */
export const authConfig: AuthConfig = {
  paths: authPaths,
  session: {
    maxAge: 30 * 24 * 60 * 60, // 30 días
    updateAge: 24 * 60 * 60, // 24 horas
  },
  providers: {
    google: process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED === 'true',
    github: process.env.NEXT_PUBLIC_AUTH_GITHUB_ENABLED === 'true',
    credentials: process.env.NEXT_PUBLIC_AUTH_CREDENTIALS_ENABLED === 'true',
  },
  pages: {
    signIn: authPaths.login,
    signUp: authPaths.register,
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
    newUser: '/auth/new-user',
  },
};

/**
 * Verifica si una ruta requiere autenticación
 * @param pathname - Ruta actual
 * @returns true si la ruta requiere autenticación
 */
export function isProtectedRoute(pathname: string): boolean {
  const protectedPatterns = [
    '/dashboard',
    '/profile',
    '/settings',
    '/admin',
  ];
  
  return protectedPatterns.some(pattern => 
    pathname === pattern || pathname.startsWith(pattern + '/')
  );
}

/**
 * Verifica si una ruta es una ruta de autenticación
 * @param pathname - Ruta actual
 * @returns true si es una ruta de autenticación
 */
export function isAuthRoute(pathname: string): boolean {
  return pathname.startsWith('/auth');
}

/**
 * Obtiene la configuración de autenticación para un proveedor específico
 * @param provider - Nombre del proveedor
 * @returns Configuración del proveedor o null si no está habilitado
 */
export function getProviderConfig(provider: keyof AuthConfig['providers']) {
  if (!authConfig.providers[provider]) {
    return null;
  }

  const envVar = `NEXT_PUBLIC_AUTH_${provider.toUpperCase()}_CLIENT_ID`;
  const clientId = process.env[envVar];

  if (!clientId) {
    console.warn(`Missing ${envVar} environment variable for ${provider} provider`);
    return null;
  }

  return {
    clientId,
    enabled: true,
  };
}

/**
 * Crea una configuración de autenticación personalizada
 * @param overrides - Sobrescrituras para la configuración predeterminada
 * @returns Configuración de autenticación personalizada
 */
export function createAuthConfig(overrides: Partial<AuthConfig>): AuthConfig {
  return {
    ...authConfig,
    ...overrides,
    paths: {
      ...authPaths,
      ...overrides.paths,
    },
    session: {
      ...authConfig.session,
      ...overrides.session,
    },
    providers: {
      ...authConfig.providers,
      ...overrides.providers,
    },
    pages: {
      ...authConfig.pages,
      ...overrides.pages,
    },
  };
}

/**
 * Hook para usar la configuración de autenticación en componentes
 * @returns Configuración de autenticación
 */
export function useAuthConfig(): AuthConfig {
  return authConfig;
}

export default authConfig;
