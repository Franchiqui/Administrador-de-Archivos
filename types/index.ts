export interface User {
  id: string;
  email: string;
  username: string;
  avatarUrl?: string;
  storageUsed: number;
  storageLimit: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  username: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// File System Types
export enum FileType {
  FOLDER = 'folder',
  IMAGE = 'image',
  VIDEO = 'video',
  DOCUMENT = 'document',
  AUDIO = 'audio',
  ARCHIVE = 'archive',
  CODE = 'code',
  OTHER = 'other'
}

export interface FileMetadata {
  width?: number;
  height?: number;
  duration?: number;
  pages?: number;
  bitrate?: number;
}

export interface FileItem {
  id: string;
  name: string;
  type: FileType;
  size: number;
  path: string;
  parentId: string | null;
  userId: string;
  mimeType: string;
  thumbnailUrl?: string;
  metadata?: FileMetadata;
  tags: Tag[];
  isStarred: boolean;
  isShared: boolean;
  permissions: FilePermissions;
  createdAt: Date;
  updatedAt: Date;
}

export interface Folder extends FileItem {
  type: FileType.FOLDER;
  itemCount: number;
}

export interface FilePermissions {
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
  canShare: boolean;
}

export interface DirectoryTree {
  id: string;
  name: string;
  type: FileType.FOLDER;
  children: DirectoryTree[];
  itemCount: number;
  isExpanded?: boolean;
}

// UI State Types
export interface UIState {
  sidebarCollapsed: boolean;
  previewPanelOpen: boolean;
  viewMode: 'grid' | 'list';
  theme: 'dark' | 'light';
  transferPanelMinimized: boolean;
}

export interface SelectionState {
  selectedIds: Set<string>;
  lastSelectedId: string | null;
}

export interface ClipboardState {
  operation: 'copy' | 'cut' | null;
  items: FileItem[];
}

// Search and Filter Types
export interface SearchFilters {
  query: string;
  fileTypes: FileType[];
  dateRange?: {
    from: Date;
    to: Date;
  };
  sizeRange?: {
    min: number; // bytes
    max: number; // bytes
  };
  tags: Tag[];
}

export interface SavedSearch {
  id: string;
  name: string;
  filters: SearchFilters;
}

// Tag and Metadata Types
export interface Tag {
  id: string;
  name: string;
  color: TagColor;
}

export type TagColor = 
  | 'red' 
  | 'orange' 
  | 'yellow' 
  | 'green' 
  | 'blue' 
  | 'purple' 
  | 'pink' 
  | 'gray';

// Transfer and Operation Types
export enum TransferStatus {
  PENDING = 'pending',
  UPLOADING = 'uploading',
  DOWNLOADING = 'downloading',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export interface TransferItem {
  id: string;
  fileId?: string;
  fileName: string;
  fileSize: number;
  progress: number; // 0-100
  speed?: number; // bytes per second
  status: TransferStatus;
  type: 'upload' | 'download';
  error?: string;
}

export interface BatchOperation {
  id: string;
  type: 'copy' | 'move' | 'delete';
  items: FileItem[];
  status: TransferStatus;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

// Event Types
export interface FileUploadEvent extends Event {
  target: HTMLInputElement & EventTarget;
}

export interface DragDropEvent extends DragEvent {
  dataTransfer: DataTransfer;
}

// Component Props Types
export interface FileGridProps {
  files: FileItem[];
  onSelect: (id: string, shiftKey?: boolean) => void;
  onDoubleClick: (file: FileItem) => void;
}

export interface FileListProps {
  files: FileItem[];
  onSelect: (id: string, shiftKey?: boolean) => void;
}

export interface DirectoryTreeProps {
  tree: DirectoryTree[];
}

export interface PreviewPanelProps {
  file?: FileItem | null;
}

// Store Types
export interface AppStore {
  // Auth
  user: User | null;
  
  // UI State
  uiState: UIState;
  
  // File System
  currentDirectoryId: string | null;
  
}