export const AUTH_CONSTANTS = {
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes in milliseconds
  TOKEN_REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutes before expiry
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
} as const;

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REGISTER: '/api/auth/register',
    REFRESH: '/api/auth/refresh',
    VERIFY: '/api/auth/verify',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
    CHANGE_PASSWORD: '/api/auth/change-password',
    SESSION: '/api/auth/session',
  },
  FILES: {
    LIST: '/api/files/list',
    UPLOAD: '/api/files/upload',
    DOWNLOAD: '/api/files/download',
    DELETE: '/api/files/delete',
    MOVE: '/api/files/move',
    COPY: '/api/files/copy',
    RENAME: '/api/files/rename',
    CREATE_FOLDER: '/api/files/create-folder',
    SEARCH: '/api/files/search',
    METADATA: '/api/files/metadata',
    PREVIEW: '/api/files/preview',
    SHARE: '/api/files/share',
  },
  USER: {
    PROFILE: '/api/user/profile',
    PREFERENCES: '/api/user/preferences',
    STORAGE_USAGE: '/api/user/storage-usage',
    ACTIVITY: '/api/user/activity',
  },
} as const;

// File type categories
export const FILE_CATEGORIES = {
  IMAGE: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'],
  VIDEO: ['mp4', 'webm', 'mov', 'avi', 'mkv', 'flv', 'wmv'],
  AUDIO: ['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac'],
  DOCUMENT: ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt', 'md'],
  SPREADSHEET: ['xls', 'xlsx', 'csv', 'ods'],
  PRESENTATION: ['ppt', 'pptx', 'odp'],
  ARCHIVE: ['zip', 'rar', '7z', 'tar', 'gz'],
  CODE: ['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'scss', 'json', 'xml', 'py', 'java', 'cpp', 'c', 'php'],
} as const;

// File size limits (in bytes)
export const FILE_SIZE_LIMITS = {
  MAX_UPLOAD_SIZE: 5 * 1024 * 1024 * 1024, // 5GB
  MAX_PREVIEW_SIZE: 50 * 1024 * 1024, // 50MB
  MAX_THUMBNAIL_SIZE: 10 * 1024 * 1024, // 10MB
} as const;

// Storage tiers
export const STORAGE_TIERS = {
  FREE: {
    MAX_STORAGE: 5 * 1024 * 1024 * 1024, // 5GB
    MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
    MAX_FILES_PER_UPLOAD: 10,
  },
  PRO: {
    MAX_STORAGE: 100 * 1024 * 1024 * 1024, // 100GB
    MAX_FILE_SIZE: 2 * 1024 * 1024 * 1024, // 2GB
    MAX_FILES_PER_UPLOAD: 50,
  },
} as const;

// UI constants
export const UI_CONSTANTS = {
  BREAKPOINTS: {
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
    '2XL': 1536,
  },
  ANIMATION_DURATIONS: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
  },
  Z_INDEXES: {
    DROPDOWN: 50,
    MODAL_BACKDROP: 100,
    MODAL: 101,
    TOOLTIP: 200,
    NOTIFICATION: 300,
    LOADING_OVERLAY: 400,
  },
} as const;

// Color constants for the dark gradient theme
export const COLORS = {
  PRIMARY_BG: '#0f172a',
  SECONDARY_BG: '#1e293b',
  INTERACTIVE_BG: '#334155',
  
  TEXT_PRIMARY: '#f8fafc',
  TEXT_SECONDARY: '#cbd5e1',
  TEXT_MUTED: '#94a3b8',
  
  BORDER_LIGHT: '#475569',
  BORDER_DARK: '#334155',
  
  ACCENT_PRIMARY: '#3b82f6',
  ACCENT_PRIMARY_HOVER: '#2563eb',
  
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  ERROR: '#ef4444',
  
  TAG_COLORS: [
    '#3b82f6', // Blue
    '#10b981', // Green
    '#f59e0b', // Yellow
    '#ef4444', // Red
    '#8b5cf6', // Purple
    '#ec4899', // Pink
    '#06b6d4', // Cyan
    '#f97316', // Orange
  ],
} as const;

// Keyboard shortcuts
export const KEYBOARD_SHORTCUTS = {
  SELECT_ALL: { key: 'a', ctrlKey: true },
  COPY: { key: 'c', ctrlKey: true },
  CUT: { key: 'x', ctrlKey: true },
  PASTE: { key: 'v', ctrlKey: true },
  DELETE: { key: 'Delete' },
  RENAME: { key: 'F2' },
  SEARCH: { key: 'f', ctrlKey: true },
} as const;

// Cache durations (in milliseconds)
export const CACHE_DURATIONS = {
  FILE_LIST_SHORT: -1, // No cache for file list (always fresh)
  FILE_LIST_LONG: -1,
  
} as const;

// Security constants
export const SECURITY_CONSTANTS = {
  
} as const;

// Validation patterns
export const VALIDATION_PATTERNS = {
  
} as const;

// Feature flags (for gradual rollout)
export const FEATURE_FLAGS = {
  
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  
} as const;

// Export all constants as a single object for easy import
export const CONSTANTS = {
  
} as const;

// Type definitions for constants
export type FileCategory = keyof typeof FILE_CATEGORIES;
export type StorageTier = keyof typeof STORAGE_TIERS;
export type ApiEndpoint = typeof API_ENDPOINTS;
export type KeyboardShortcut = typeof KEYBOARD_SHORTCUTS;