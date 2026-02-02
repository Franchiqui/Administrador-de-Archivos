'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: number;
  modifiedAt: Date;
  createdAt: Date;
  ownerId: string;
  path: string;
  parentPath: string;
  isStarred?: boolean;
  isShared?: boolean;
  sharedWith?: string[];
  mimeType?: string;
  thumbnailUrl?: string;
}

export interface FileStoreState {
  currentPath: string;
  files: FileItem[];
  selectedFiles: Set<string>;
  isLoading: boolean;
  error: string | null;
  recentFiles: FileItem[];
  starredFiles: FileItem[];
  searchQuery: string;
  viewMode: 'grid' | 'list';
  sortBy: 'name' | 'date' | 'size' | 'type';
  sortOrder: 'asc' | 'desc';
  
  // Actions
  setCurrentPath: (path: string) => void;
  setFiles: (files: FileItem[]) => void;
  addFile: (file: FileItem) => void;
  updateFile: (id: string, updates: Partial<FileItem>) => void;
  deleteFile: (id: string) => void;
  deleteFiles: (ids: string[]) => void;
  toggleFileSelection: (id: string) => void;
  clearSelection: () => void;
  selectAll: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addToRecent: (file: FileItem) => void;
  toggleStar: (id: string) => void;
  setSearchQuery: (query: string) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  setSortBy: (sortBy: 'name' | 'date' | 'size' | 'type') => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  
  // File operations
  createFolder: (name: string, parentPath?: string) => Promise<FileItem>;
  uploadFile: (file: File, parentPath?: string) => Promise<FileItem>;
  renameFile: (id: string, newName: string) => Promise<void>;
  moveFiles: (fileIds: string[], destinationPath: string) => Promise<void>;
  copyFiles: (fileIds: string[], destinationPath: string) => Promise<void>;
  shareFiles: (fileIds: string[], userIds: string[]) => Promise<void>;
  
  // Computed values
  getCurrentDirectoryFiles: () => FileItem[];
  getFileById: (id: string) => FileItem | undefined;
  getFilesByPath: (path: string) => FileItem[];
  getBreadcrumbPaths: () => string[];
}

export const useFileStore = create<FileStoreState>()(
  persist(
    (set, get) => ({
      currentPath: '/',
      files: [],
      selectedFiles: new Set(),
      isLoading: false,
      error: null,
      recentFiles: [],
      starredFiles: [],
      searchQuery: '',
      viewMode: 'grid',
      sortBy: 'name',
      sortOrder: 'asc',

      setCurrentPath: (path) => {
        set({ currentPath: path, selectedFiles: new Set() });
      },

      setFiles: (files) => set({ files }),

      addFile: (file) => {
        set((state) => ({
          files: [...state.files, file],
        }));
      },

      updateFile: (id, updates) => {
        set((state) => ({
          files: state.files.map((file) =>
            file.id === id ? { ...file, ...updates, modifiedAt: new Date() } : file
          ),
          recentFiles: state.recentFiles.map((file) =>
            file.id === id ? { ...file, ...updates, modifiedAt: new Date() } : file
          ),
          starredFiles: state.starredFiles.map((file) =>
            file.id === id ? { ...file, ...updates, modifiedAt: new Date() } : file
          ),
        }));
      },

      deleteFile: (id) => {
        set((state) => ({
          files: state.files.filter((file) => file.id !== id),
          selectedFiles: new Set([...state.selectedFiles].filter((fileId) => fileId !== id)),
          recentFiles: state.recentFiles.filter((file) => file.id !== id),
          starredFiles: state.starredFiles.filter((file) => file.id !== id),
        }));
      },

      deleteFiles: (ids) => {
        set((state) => ({
          files: state.files.filter((file) => !ids.includes(file.id)),
          selectedFiles: new Set([...state.selectedFiles].filter((fileId) => !ids.includes(fileId))),
          recentFiles: state.recentFiles.filter((file) => !ids.includes(file.id)),
          starredFiles: state.starredFiles.filter((file) => !ids.includes(file.id)),
        }));
      },

      toggleFileSelection: (id) => {
        set((state) => {
          const newSelection = new Set(state.selectedFiles);
          if (newSelection.has(id)) {
            newSelection.delete(id);
          } else {
            newSelection.add(id);
          }
          return { selectedFiles: newSelection };
        });
      },

      clearSelection: () => {
        set({ selectedFiles: new Set() });
      },

      selectAll: () => {
        const state = get();
        const currentFiles = state.getCurrentDirectoryFiles();
        const allIds = new Set(currentFiles.map((file) => file.id));
        set({ selectedFiles: allIds });
      },

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      addToRecent: (file) => {
        set((state) => {
          const filtered = state.recentFiles.filter((f) => f.id !== file.id);
          const updated = [file, ...filtered].slice(0, 20); // Keep last 20
          return { recentFiles: updated };
        });
      },

      toggleStar: (id) => {
        const state = get();
        const file = state.files.find((f) => f.id === id);
        if (!file) return;

        const isStarred = !file.isStarred;
        state.updateFile(id, { isStarred });

        set((state) => {
          if (isStarred) {
            const alreadyStarred = state.starredFiles.some((f) => f.id === id);
            if (!alreadyStarred) {
              return { starredFiles: [...state.starredFiles, { ...file, isStarred }] };
            }
          } else {
            return { starredFiles: state.starredFiles.filter((f) => f.id !== id) };
          }
          return {};
        });
      },

      setSearchQuery: (query) => set({ searchQuery: query }),

      setViewMode: (mode) => set({ viewMode: mode }),

      setSortBy: (sortBy) => set({ sortBy }),

      setSortOrder: (order) => set({ sortOrder: order }),

      createFolder: async (name, parentPath) => {
        const state = get();
        const path = parentPath || state.currentPath;
        const fullPath = path === '/' ? `/${name}` : `${path}/${name}`;

        const newFolder: FileItem = {
          id: `folder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name,
          type: 'folder',
          createdAt: new Date(),
          modifiedAt: new Date(),
          ownerId: 'current-user', // This should come from auth store
          path: fullPath,
          parentPath: path,
        };

        state.addFile(newFolder);
        return newFolder;
      },

      uploadFile: async (file, parentPath) => {
        const state = get();
        const path = parentPath || state.currentPath;
        const fullPath = path === '/' ? `/${file.name}` : `${path}/${file.name}`;

        const newFile: FileItem = {
          id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          type: 'file',
          size: file.size,
          mimeType: file.type,
          createdAt: new Date(),
          modifiedAt: new Date(),
          ownerId: 'current-user',
          path: fullPath,
          parentPath: path,
        };

        state.addFile(newFile);
        state.addToRecent(newFile);
        return newFile;
      },

      renameFile: async (id, newName) => {
        const state = get();
        const file = state.files.find((f) => f.id === id);
        if (!file) throw new Error('File not found');

        const oldPath = file.path;
        const newPath = file.parentPath === '/' ? `/${newName}` : `${file.parentPath}/${newName}`;

        // Update the file and all its children if it's a folder
        const updatedFiles = state.files.map((f) => {
          if (f.id === id) {
            return { ...f, name: newName, path: newPath, modifiedAt: new Date() };
          }
          // Update child paths if this is a folder
          if (f.path.startsWith(oldPath + '/')) {
            const newChildPath = f.path.replace(oldPath, newPath);
            return { ...f, path: newChildPath, parentPath: f.parentPath.replace(oldPath, newPath) };
          }
          return f;
        });

        set({ files: updatedFiles });
      },

      moveFiles: async (fileIds, destinationPath) => {
        const state = get();
        const updatedFiles = state.files.map((file) => {
          if (fileIds.includes(file.id)) {
            const newPath = destinationPath === '/' ? `/${file.name}` : `${destinationPath}/${file.name}`;
            return { ...file, path: newPath, parentPath: destinationPath, modifiedAt: new Date() };
          }
          return file;
        });

        set({ files: updatedFiles, selectedFiles: new Set() });
      },

      copyFiles: async (fileIds, destinationPath) => {
        const state = get();
        const newFiles: FileItem[] = [];

        fileIds.forEach((id) => {
          const original = state.files.find((f) => f.id === id);
          if (original) {
            const newFile: FileItem = {
              ...original,
              id: `${original.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              path: destinationPath === '/' ? `/${original.name}` : `${destinationPath}/${original.name}`,
              parentPath: destinationPath,
              createdAt: new Date(),
              modifiedAt: new Date(),
            };
            newFiles.push(newFile);
          }
        });

        set((state) => ({ files: [...state.files, ...newFiles] }));
      },

      shareFiles: async (fileIds, userIds) => {
        const state = get();
        fileIds.forEach((id) => {
          state.updateFile(id, {
            isShared: true,
            sharedWith: userIds,
          });
        });
      },

      // Computed values
      getCurrentDirectoryFiles: () => {
        const state = get();
        return state.files
          .filter((file) => file.parentPath === state.currentPath)
          .sort((a, b) => {
            const order = state.sortOrder === 'asc' ? 1 : -1;
            switch (state.sortBy) {
              case 'name':
                return a.name.localeCompare(b.name) * order;
              case 'date':
                return (a.modifiedAt.getTime() - b.modifiedAt.getTime()) * order;
              case 'size':
                return ((a.size || 0) - (b.size || 0)) * order;
              case 'type':
                return a.type.localeCompare(b.type) * order;
              default:
                return 0;
            }
          });
      },

      getFileById: (id) => {
        const state = get();
        return state.files.find((file) => file.id === id);
      },

      getFilesByPath: (path) => {
        const state = get();
        return state.files.filter((file) => file.parentPath === path);
      },

      getBreadcrumbPaths: () => {
        const state = get();
        const parts = state.currentPath.split('/').filter(Boolean);
        const paths = ['/'];
        let currentPath = '';
        
        parts.forEach((part) => {
          currentPath += `/${part}`;
          paths.push(currentPath);
        });
        
        return paths;
      },
    }),
    {
      name: 'file-storage',
      partialize: (state) => ({
        currentPath: state.currentPath,
        files: state.files,
        recentFiles: state.recentFiles,
        starredFiles: state.starredFiles,
        viewMode: state.viewMode,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
      }),
    }
  )
);
