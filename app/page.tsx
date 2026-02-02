'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  Search, 
  Upload, 
  FolderPlus, 
  Copy, 
  Scissors, 
  ClipboardPaste, 
  Trash2, 
  Download, 
  Share2,
  Grid3x3,
  List,
  ChevronLeft,
  ChevronRight,
  Star,
  HardDrive,
  Image as ImageIcon,
  FileText,
  Film,
  Music,
  Archive,
  MoreVertical,
  Tag,
  Info,
  Filter,
  Check,
  Loader2
} from 'lucide-react';
import Footer from '@/components/layout/footer';

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size: number;
  modified: Date;
  icon?: string;
  tags: string[];
}

interface DirectoryNode {
  id: string;
  name: string;
  children?: DirectoryNode[];
}

const initialFiles: FileItem[] = [
  { id: '1', name: 'Document.pdf', type: 'file', size: 2048000, modified: new Date(), tags: ['work'], icon: 'pdf' },
  { id: '2', name: 'Vacation Photos', type: 'folder', size: 0, modified: new Date(), tags: ['personal'] },
  { id: '3', name: 'Screenshot.png', type: 'file', size: 512000, modified: new Date(), tags: [], icon: 'image' },
  { id: '4', name: 'Project Files', type: 'folder', size: 0, modified: new Date(), tags: ['work', 'urgent'] },
  { id: '5', name: 'Video.mp4', type: 'file', size: 10485760, modified: new Date(), tags: ['media'], icon: 'video' },
  { id: '6', name: 'Music Collection', type: 'folder', size: 0, modified: new Date(), tags: ['media'] },
  { id: '7', name: 'Report.docx', type: 'file', size: 1024000, modified: new Date(), tags: ['work'], icon: 'doc' },
  { id: '8', name: 'Archive.zip', type: 'file', size: 5120000, modified: new Date(), tags: [], icon: 'archive' },
];

const initialDirectoryTree: DirectoryNode[] = [
  {
    id: 'root',
    name: 'Home',
    children: [
      { id: 'docs', name: 'Documents' },
      { id: 'images', name: 'Images' },
      { id: 'videos', name: 'Videos' },
      {
        id: 'projects',
        name: 'Projects',
        children: [
          { id: 'project1', name: 'Project Alpha' },
          { id: 'project2', name: 'Project Beta' }
        ]
      }
    ]
  }
];

export default function HomePage() {
  const router = useRouter();
  
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // UI states
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [currentDirectory, setCurrentDirectory] = useState<string>('/');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPreviewPanel, setShowPreviewPanel] = useState(false);
  const [showTransferPanel, setShowTransferPanel] = useState(false);
  
  // Data states
  const [files, setFiles] = useState<FileItem[]>(initialFiles);
  const [directoryTree, setDirectoryTree] = useState<DirectoryNode[]>(initialDirectoryTree);
  
  // Clipboard state
  const [clipboard, setClipboard] = useState<{ type: 'copy' | 'cut'; items: string[] } | null>(null);
  
  // Transfer queue
  const [transfers, setTransfers] = useState<Array<{
    id: string;
    fileName: string;
    progress: number;
    speed: number;
    status: 'uploading' | 'downloading' | 'paused' | 'completed' | 'error';
  }>>([]);
  
  // Filter states
  const [fileTypeFilter, setFileTypeFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Authentication check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Simulate auth check
        await new Promise(resolve => setTimeout(resolve, 500));
        setIsAuthenticated(true);
      } catch (error) {
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [router]);
  
  // Filter files based on search and filters
  const filteredFiles = useCallback(() => {
    return files.filter(file => {
      const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = fileTypeFilter === 'all' || 
        (fileTypeFilter === 'folder' && file.type === 'folder') ||
        (fileTypeFilter === 'image' && file.icon === 'image') ||
        (fileTypeFilter === 'document' && ['pdf', 'doc'].includes(file.icon || '')) ||
        (fileTypeFilter === 'media' && ['video', 'music'].includes(file.icon || ''));
      
      return matchesSearch && matchesType;
    });
  }, [files, searchQuery, fileTypeFilter]);
  
  // File operations
  const handleFileSelect = useCallback((fileId: string, event?: React.MouseEvent) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      if (event?.ctrlKey || event?.metaKey) {
        if (newSet.has(fileId)) {
          newSet.delete(fileId);
        } else {
          newSet.add(fileId);
        }
      } else if (event?.shiftKey && prev.size > 0) {
        // Implement shift selection logic
        const fileIds = files.map(f => f.id);
        const lastSelected = Array.from(prev).pop();
        const currentIndex = fileIds.indexOf(fileId);
        const lastIndex = lastSelected ? fileIds.indexOf(lastSelected) : -1;
        
        if (lastIndex !== -1) {
          const start = Math.min(currentIndex, lastIndex);
          const end = Math.max(currentIndex, lastIndex);
          for (let i = start; i <= end; i++) {
            newSet.add(fileIds[i]);
          }
        }
      } else {
        newSet.clear();
        newSet.add(fileId);
      }
      return newSet;
    });
    
    if (!event?.ctrlKey && !event?.metaKey && !event?.shiftKey) {
      setShowPreviewPanel(true);
    }
  }, [files]);
  
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const filesList = event.target.files;
    if (!filesList) return;
    
    Array.from(filesList).forEach((file, index) => {
      const transferId = `transfer-${Date.now()}-${index}`;
      setTransfers(prev => [...prev, {
        id: transferId,
        fileName: file.name,
        progress: 0,
        speed: Math.random() * 1024 * 1024,
        status: 'uploading'
      }]);
      
      setShowTransferPanel(true);
      
      // Simulate upload progress
      const interval = setInterval(() => {
        setTransfers(prev => prev.map(t => 
          t.id === transferId 
            ? { ...t, progress: Math.min(t.progress + Math.random() * 10, 100) }
            : t
        ));
      }, 200);
      
      setTimeout(() => {
        clearInterval(interval);
        setTransfers(prev => prev.map(t => 
          t.id === transferId 
            ? { ...t, progress: 100, status: 'completed' }
            : t
        ));
        
        // Add to files list
        setTimeout(() => {
          setFiles(prev => [...prev, {
            id: `new-${Date.now()}-${index}`,
            name: file.name,
            type: 'file',
            size: file.size,
            modified: new Date(),
            tags: [],
            icon: getFileIconType(file.name)
          }]);
          
          // Remove completed transfer after delay
          setTimeout(() => {
            setTransfers(prev => prev.filter(t => t.id !== transferId));
          }, 3000);
        }, 500);
      }, Math.random() * 3000 + 1000);
    });
    
    event.target.value = '';
  };
  
  const getFileIconType = (fileName: string): string => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return 'image';
    if (['pdf'].includes(ext || '')) return 'pdf';
    if (['doc', 'docx'].includes(ext || '')) return 'doc';
    if (['mp4', 'mov', 'avi'].includes(ext || '')) return 'video';
    if (['mp3', 'wav'].includes(ext || '')) return 'music';
    if (['zip', 'rar'].includes(ext || '')) return 'archive';
    return '';
  };
  
  const handleCopy = () => {
    if (selectedFiles.size > 0) {
      setClipboard({
        type: 'copy',
        items: Array.from(selectedFiles)
      });
    }
  };
  
  const handleCut = () => {
    if (selectedFiles.size > 0) {
      setClipboard({
        type: 'cut',
        items: Array.from(selectedFiles)
      });
    }
  };
  
  const handlePaste = () => {
    if (!clipboard) return;
    
    // Implement paste logic here
    console.log(`Pasting ${clipboard.type} operation for items:`, clipboard.items);
    
    if (clipboard.type === 'cut') {
      setClipboard(null);
    }
  };
  
  const handleDelete = () => {
    if (selectedFiles.size > 0 && confirm(`Delete ${selectedFiles.size} item(s)?`)) {
      setFiles(prev => prev.filter(file => !selectedFiles.has(file.id)));
      setSelectedFiles(new Set());
      setShowPreviewPanel(false);
    }
  };
  
  const handleNewFolder = () => {
    const folderName = prompt('Enter folder name:', 'New Folder');
    if (folderName) {
      setFiles(prev => [...prev, {
        id: `folder-${Date.now()}`,
        name: folderName,
        type: 'folder',
        size: 0,
        modified: new Date(),
        tags: []
      }]);
    }
  };
  
  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '-';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + sizes[i];
  };
  
  // Get selected file for preview
  const selectedFile = files.find(file => selectedFiles.has(file.id));
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-950">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-300">Loading NexusFile Manager...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return null; // Router will redirect
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 text-gray-100 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gray-900/90 backdrop-blur-md border-b border-gray-800">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
              </button>
              
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  NexusFile Manager
                </h1>
                <p className="text-xs text-gray-400">Organiza tu universo digital con elegancia y potencia.</p>
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar archivos y carpetas..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-700 rounded">
                  <Filter size={16} />
                </button>
              </div>
            </div>
            
            {/* Storage Indicator */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium">75.4 GB / 100 GB</p>
                <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                    style={{ width: '75.4%' }}
                  />
                </div>
              </div>
              <HardDrive className="text-blue-400" />
            </div>
          </div>
          
          {/* Toolbar */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={handleUploadClick}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg flex items-center space-x-2 transition-all active:scale-[0.98]"
              >
                <Upload size={18} />
                <span>Subir</span>
              </button>
              
              <button
                onClick={handleNewFolder}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <FolderPlus size={18} />
                <span>Nueva Carpeta</span>
              </button>
              
              <div className="h-6 w-px bg-gray-700 mx-2" />
              
              <button
                onClick={handleCopy}
                disabled={selectedFiles.size === 0}
                className={`px-3 py-2 rounded-lg flex items-center space-x-1 transition-colors ${selectedFiles.size === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'}`}
              >
                <Copy size={16} />
                <span>Copiar</span>
              </button>
              
              <button
                onClick={handleCut}
                disabled={selectedFiles.size === 0}
                className={`px-3 py-2 rounded-lg flex items-center space-x-1 transition-colors ${selectedFiles.size === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'}`}
              >
                <Scissors size={16} />
                <span>Cortar</span>
              </button>
              
              <button
                onClick={handlePaste}
                disabled={!clipboard}
                className={`px-3 py-2 rounded-lg flex items-center space-x-1 transition-colors ${!clipboard ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'}`}
              >
                <ClipboardPaste size={16} />
                <span>Pegar</span>
              </button>
              
              <button
                onClick={handleDelete}
                disabled={selectedFiles.size === 0}
                className={`px-3 py-2 rounded-lg flex items-center space-x-1 transition-colors ${selectedFiles.size === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-900/20 hover:text-red-400'}`}
              >
                <Trash2 size={16} />
                <span>Eliminar</span>
              </button>
              
              <button
                onClick={() => {}}
                disabled={selectedFiles.size === 0}
                className={`px-3 py-2 rounded-lg flex items-center space-x-1 transition-colors ${selectedFiles.size === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'}`}
              >
                <Download size={16} />
                <span>Descargar</span>
              </button>
              
              <button
                onClick={() => {}}
                disabled={selectedFiles.size === 0}
                className={`px-3 py-2 rounded-lg flex items-center space-x-1 transition-colors ${selectedFiles.size === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'}`}
              >
                <Share2 size={16} />
                <span>Compartir</span>
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-gray-800' : 'hover:bg-gray-800'}`}
              >
                <Grid3x3 size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-gray-800' : 'hover:bg-gray-800'}`}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        multiple
        className="hidden"
      />
      
      <div className="flex">
        {/* Sidebar */}
        <aside className={`${sidebarCollapsed ? 'w-16' : 'w-64'} transition-all duration-300 border-r border-gray-800 bg-gray-900/50`}>
          <div className="p-4">
            <h2 className="font-semibold text-gray-400 mb-4">Explorador</h2>
            <nav className="space-y-1">
              {directoryTree.map((node) => (
                <div key={node.id}>
                  <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-800 flex items-center justify-between">
                    <span>{node.name}</span>
                    {node.children && <ChevronRight size={16} />}
                  </button>
                </div>
              ))}
            </nav>
          </div>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Archivos</h2>
            <p className="text-gray-400">{filteredFiles().length} elementos</p>
          </div>
          
          {/* File Grid/List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredFiles().map((file) => (
              <div
                key={file.id}
                onClick={(e) => handleFileSelect(file.id, e)}
                className={`p-4 rounded-lg border ${selectedFiles.has(file.id) ? 'border-blue-500 bg-blue-900/20' : 'border-gray-800 bg-gray-900/50'} hover:bg-gray-800/50 cursor-pointer transition-colors`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-800 rounded-lg">
                      {file.type === 'folder' ? (
                        <FolderPlus size={24} className="text-blue-400" />
                      ) : (
                        <FileText size={24} className="text-gray-300" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium truncate">{file.name}</h3>
                      <p className="text-sm text-gray-400">
                        {file.type === 'folder' ? 'Carpeta' : formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <MoreVertical size={18} className="text-gray-400" />
                </div>
                
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {file.tags.map((tag) => (
                      <span key={tag} className="px-2 py-1 text-xs bg-gray-800 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs text-gray-400">
                    {file.modified.toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
      
      <Footer />
    </div>
  );
}
