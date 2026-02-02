'use client';

'use client';

import React, { useState, useCallback, memo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Folder,
  FolderOpen,
  File,
  Image as ImageIcon,
  Video,
  Music,
  FileText,
  Archive,
  ChevronRight,
  ChevronDown,
  Search,
  Star,
  Home,
  Download,
  Upload,
  HardDrive,
  Users,
  Settings,
  LogOut,
  Plus,
  MoreVertical,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { useFileStore } from '@/stores/file-store';

interface DirectoryNode {
  id: string;
  name: string;
  type: 'folder' | 'file';
  children?: DirectoryNode[];
  isExpanded?: boolean;
  isBookmarked?: boolean;
  icon?: React.ReactNode;
}

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const Sidebar = memo(({ isCollapsed, onToggleCollapse }: SidebarProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [directories, setDirectories] = useState<DirectoryNode[]>([
    {
      id: '1',
      name: 'Home',
      type: 'folder',
      isExpanded: true,
      isBookmarked: true,
      icon: <Home className="h-4 w-4" />,
      children: [
        { id: '2', name: 'Documents', type: 'folder', icon: <FileText className="h-4 w-4" /> },
        { id: '3', name: 'Pictures', type: 'folder', icon: <ImageIcon className="h-4 w-4" /> },
        { id: '4', name: 'Videos', type: 'folder', icon: <Video className="h-4 w-4" /> },
        { id: '5', name: 'Music', type: 'folder', icon: <Music className="h-4 w-4" /> },
        { id: '6', name: 'Downloads', type: 'folder', icon: <Download className="h-4 w-4" /> }
      ]
    },
    {
      id: '7',
      name: 'Shared with me',
      type: 'folder',
      isBookmarked: true,
      icon: <Users className="h-4 w-4" />,
      children: []
    },
    {
      id: '8',
      name: 'Recent',
      type: 'folder',
      icon: <HardDrive className="h-4 w-4" />,
      children: []
    }
  ]);

  const [bookmarks, setBookmarks] = useState<DirectoryNode[]>([
    { id: '9', name: 'Projects', type: 'folder', isBookmarked: true, icon: <Folder className="h-4 w-4" /> },
    { id: '10', name: 'Backups', type: 'folder', isBookmarked: true, icon: <Archive className="h-4 w-4" /> }
  ]);

  const { user, logout } = useAuthStore();
  const { currentPath, setCurrentPath, createFolder } = useFileStore();

  const toggleDirectory = useCallback((id: string) => {
    setDirectories(prev => 
      prev.map(dir => ({
        ...dir,
        children: dir.children?.map(child => 
          child.id === id ? { ...child, isExpanded: !child.isExpanded } : child
        )
      }))
    );
  }, []);

  const handleDirectoryClick = useCallback((path: string) => {
    setCurrentPath(path);
  }, [setCurrentPath]);

  const handleCreateFolder = useCallback(() => {
    const folderName = prompt('Enter folder name');
    if (folderName && user) {
      createFolder(folderName, currentPath);
    }
  }, [createFolder, currentPath, user]);

  const filteredDirectories = useCallback(() => {
    if (!searchQuery.trim()) return directories;
    
    const filterNodes = (nodes: DirectoryNode[]): DirectoryNode[] => {
      return nodes
        .map(node => ({
          ...node,
          children: node.children ? filterNodes(node.children) : undefined
        }))
        .filter(node => 
          node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          node.children?.length > 0
        );
    };

    return filterNodes(directories);
  }, [directories, searchQuery]);

  const renderDirectoryTree = useCallback((nodes: DirectoryNode[], depth = 0) => {
    return nodes.map(node => (
      <div key={node.id} className="select-none">
        <div
          className={cn(
            "flex items-center px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer",
            "hover:bg-[#1e293b]/50 active:scale-[0.98]",
            currentPath === `/${node.name}` && "bg-[#334155]/30"
          )}
          style={{ paddingLeft: `${depth * 20 + 12}px` }}
          onClick={() => handleDirectoryClick(`/${node.name}`)}
          role="button"
          tabIndex={0}
          aria-label={`Navigate to ${node.name}`}
          onKeyDown={(e) => e.key === 'Enter' && handleDirectoryClick(`/${node.name}`)}
        >
          <button
            className="mr-2 p-1 hover:bg-[#1e293b] rounded"
            onClick={(e) => {
              e.stopPropagation();
              toggleDirectory(node.id);
            }}
            aria-label={node.isExpanded ? `Collapse ${node.name}` : `Expand ${node.name}`}
          >
            {node.type === 'folder' && (
              node.isExpanded ? 
                <ChevronDown className="h-3 w-3" /> : 
                <ChevronRight className="h-3 w-3" />
            )}
          </button>
          
          <div className="flex items-center flex-1 min-w-0">
            <span className="mr-2 text-[#94a3b8]">
              {node.icon || (node.type === 'folder' ? 
                (node.isExpanded ? 
                  <FolderOpen className="h-4 w-4" /> : 
                  <Folder className="h-4 w-4" />
                ) : 
                <File className="h-4 w-4" />
              )}
            </span>
            <span className="truncate text-sm font-medium text-[#e2e8f0]">
              {node.name}
            </span>
          </div>

          {node.isBookmarked && (
            <Star className="h-3 w-3 ml-2 fill-yellow-400 text-yellow-400" />
          )}
        </div>

        {node.children && node.isExpanded && (
          <div className="mt-1">
            {renderDirectoryTree(node.children, depth + 1)}
          </div>
        )}
      </div>
    ));
  }, [currentPath, handleDirectoryClick, toggleDirectory]);

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 64 : 280 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={cn(
        "flex flex-col h-full bg-gradient-to-b from-[#0f172a] to-[#1a2332]",
        "border-r border-[#334155]/30 shadow-xl"
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-[#334155]/30">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center space-x-2"
            >
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600" />
              <div>
                <h1 className="font-bold text-lg bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  NexusFile
                </h1>
                <p className="text-xs text-[#94a3b8]">Organize your digital universe</p>
              </div>
            </motion.div>
          )}
          
          <button
            onClick={onToggleCollapse}
            className={cn(
              "p-2 rounded-lg transition-all duration-200",
              "hover:bg-[#1e293b] active:scale-[0.98]",
              isCollapsed && "mx-auto"
            )}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronRight className={cn(
              "h-5 w-5 text-[#94a3b8] transition-transform duration-300",
              isCollapsed ? "rotate-180" : ""
            )} />
          </button>
        </div>

        {/* Search */}
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 relative"
          >
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#64748b]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search directories..."
              className="w-full pl-10 pr-4 py-2 bg-[#1e293b]/50 border border-[#334155]/50 rounded-lg text-sm text-[#e2e8f0] placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all"
              aria-label="Search directories"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-[#334155] rounded"
                aria-label="Clear search"
              >
                <X className="h-3 w-3 text-[#64748b]" />
              </button>
            )}
          </motion.div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#334155] scrollbar-track-transparent p-3">
        {/* Quick Actions */}
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6"
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">
                Quick Actions
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleCreateFolder}
                className={cn(
                  "flex items-center justify-center p-3 rounded-lg transition-all duration-200",
                  "bg-gradient-to-r from-[#1e293b] to-[#334155]/50 border border-[#334155]/50",
                  "hover:from-[#334155] hover:to-[#475569]/50 active:scale-[0.98]",
                  "group"
                )}
                aria-label="Create new folder"
              >
                <Plus className="h-5 w-5 text-blue-400 group-hover:text-blue-300" />
                {!isCollapsed && (
                  <span className="ml-2 text-sm font-medium text-[#e2e8f0]">
                    New Folder
                  </span>
                )}
              </button>
              <button
                onClick={() => document.getElementById('file-upload')?.click()}
                className={cn(
                  "flex items-center justify-center p-3 rounded-lg transition-all duration-200",
                  "bg-gradient-to-r from-[#1e293b] to-[#334155]/50 border border-[#334155]/50",
                  "hover:from-[#334155] hover:to-[#475569]/50 active:scale-[0.98]",
                  "group"
                )}
                aria-label="Upload files"
              >
                <Upload className="h -5 w -5 text-green -400 group -hover:text-green -300" />
                {!isCollapsed && (
                  <span className = "ml -2 text -sm font -medium text -[#e2e8f0]" >
                    Upload
                  </span>
                )}
              </button>
            </div>
            <input
              id = "file -upload"
              type = "file"
              multiple
              className = "hidden"
              onChange = {(e) => {
                // Handle file upload logic here
                console.log('Files selected:', e.target.files);
              }}
            />
          </motion.div>
        )}

        {/* Bookmarks */}
        {!isCollapsed && bookmarks.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className = "mb -6"
          >
            <div className = "flex items -center justify -between mb -2" >
              <h2 className = "text -xs font -semibold uppercase tracking -wider text -[#94a3b8]" >
                Bookmarks
              </h2>
              <Star className = "h -3 w -3 text -yellow -400/50" />
            </div>
            <div className = "space -y -1" >
              {bookmarks.map((bookmark) => (
                <button
                  key = {bookmark.id}
                  onClick = {() => handleDirectoryClick(`/${bookmark.name}`)}
                  className = {cn(
                    "flex items -center w -full px -3 py -2 rounded -lg transition -all duration -200",
                    "hover :bg -[#1e293b]/50 active :scale -[0.98]",
                    currentPath === `/${bookmark.name}` && "bg -[#334155]/30"
                  )}
                  aria-label = {`Navigate to ${bookmark.name}`}
                >
                  <span className = "mr -3 text -[#94a3b8]" >
                    {bookmark.icon || <Folder className = "h -4 w -4" />}
                  </span>
                  <span className = "text -sm font -medium text -[#e2e8f0] truncate" >
                    {bookmark.name}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Directory Tree */}
        <div>
          {!isCollapsed && (
            <div className = "flex items -center justify -between mb -2" >
              <h2 className = "text -xs font -semibold uppercase tracking -wider text -[#94a3b8]" >
                Directories
              </h2>
              <FolderOpen className = "h -3 w -3 text -[#64748b]" />
            </div>
          )}
          <div className = "space -y -1" >
            {renderDirectoryTree(filteredDirectories())}
          </div>
        </div>
      </div>

      {/* User Profile */}
      <div className = "p -4 border -t border -[#334155]/30" >
        {user && !isCollapsed ? (
          <motion.div
            initial={{ opacity : 0 }}
            animate={{ opacity : 1 }}
            className = "flex items -center justify -between"
          >
            <div className = "flex items -center space -x -3" >
              <div className = "h -10 w -10 rounded -full bg -gradient -to -br from -blue -500 to -purple -600 flex items -center justify -center" >
                <span className = "font -bold text -white" >
                  {user.email?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className = "min -w -0" >
                <p className = "text -sm font -medium text -[#e2e8f0] truncate" >
                  {user.email}
                </p>
                <p className = "text -xs text -[#94a3b8]" > Free plan </p>
              </div>
            </div>
            <div className = "flex items -center space -x -1" >
              <button
                onClick = {() => {/* Open settings */}}
                className = "p -2 rounded -lg transition-all duration-200 hover :bg-[#1e293b] active :scale-[0.98]"
                aria-label = "Settings"
              >
                <Settings className = "h -4 w -4 text-[#94a3b8]" />
              </button>
              <button
                onClick = {logout}
                className = "p -2 rounded-lg transition-all duration-200 hover :bg-[#1e293b] active :scale-[0.98]"
                aria-label = "Logout"
              >
                <LogOut className = "h -4 w -4 text-[#94a3b8]" />
              </button>
            </div>
          </motion.div>
        ) : (
          <div className = "flex justify-center" >
            <button
              onClick = {logout}
              className = "p -2 rounded-lg transition-all duration-200 hover :bg-[#1e293b] active :scale-[0.98]"
              aria-label = "Logout"
            >
              <LogOut className = "h -5 w -5 text-[#94a3b8]" />
            </button>
          </div>
        )}
      </div>
    </motion.aside>
  );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;