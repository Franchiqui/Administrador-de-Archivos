'use client';

'use client';

import React, { memo, useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  Search, 
  Bell, 
  User, 
  Upload, 
  FolderPlus, 
  HardDrive,
  ChevronDown,
  LogOut,
  Settings
} from 'lucide-react';
import { Menu as HeadlessMenu, Transition } from '@headlessui/react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';

interface HeaderProps {
  onMenuToggle?: () => void;
  onSearch?: (query: string) => void;
  onUploadClick?: () => void;
  onNewFolderClick?: () => void;
  storageUsage?: {
    used: number;
    total: number;
    percentage: number;
  };
}

const Header = memo(function Header({
  onMenuToggle,
  onSearch,
  onUploadClick,
  onNewFolderClick,
  storageUsage = { used: 0, total: 10737418240, percentage: 0 }
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  
  const { user, logout } = useAuthStore();
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch?.(value);
  }, [onSearch]);
  
  const handleLogout = useCallback(async () => {
    await logout();
    router.push('/login');
  }, [logout, router]);
  
  const handleUpload = useCallback(() => {
    onUploadClick?.();
  }, [onUploadClick]);
  
  const handleNewFolder = useCallback(() => {
    onNewFolderClick?.();
  }, [onNewFolderClick]);
  
  const storageGBUsed = (storageUsage.used / 1073741824).toFixed(1);
  const storageGBTotal = (storageUsage.total / 1073741824).toFixed(0);
  
  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        isScrolled
          ? 'bg-gradient-to-b from-gray-900/95 to-gray-900/90 backdrop-blur-lg border-b border-gray-800/50'
          : 'bg-gradient-to-b from-gray-900 to-gray-900/95'
      )}
    >
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left section - Logo and menu toggle */}
          <div className="flex items-center">
            <button
              type="button"
              onClick={onMenuToggle}
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
              aria-label="Toggle menu"
            >
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>
            
            <Link href="/dashboard" className="ml-4 lg:ml-0">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg blur opacity-75" />
                  <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-2">
                    <HardDrive className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    NexusFile Manager
                  </h1>
                  <p className="text-xs text-gray-400">Organiza tu universo digital</p>
                </div>
              </div>
            </Link>
          </div>
          
          {/* Center section - Search */}
          <div className="flex flex-1 items-center justify-center px-4 lg:px-8">
            <div className="w-full max-w-2xl">
              <div className={cn(
                'relative rounded-lg transition-all duration-300',
                isSearchFocused 
                  ? 'ring-2 ring-blue-500 ring-opacity-50' 
                  : 'ring-1 ring-gray-700'
              )}>
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={handleSearch}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  placeholder="Buscar archivos y carpetas..."
                  className="block w-full rounded-lg border-0 bg-gray-800/50 py-2.5 pl-10 pr-4 text-white placeholder:text-gray-400 focus:outline-none focus:ring-0 sm:text-sm"
                  aria-label="Buscar archivos y carpetas"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      onSearch?.('');
                    }}
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    aria-label="Clear search"
                  >
                    <X className="h-5 w-5 text-gray-400 hover:text-white" />
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Right section - Actions and user menu */}
          <div className="flex items-center space-x-3 lg:space-x-4">
            {/* Storage indicator */}
            <div className="hidden md:block">
              <div className="flex items-center space-x-2 rounded-lg bg-gray-800/50 px-3 py-2">
                <div className="w-32">
                  <div className="flex justify-between text-xs text-gray-300 mb-1">
                    <span>{storageGBUsed} GB</span>
                    <span>{storageGBTotal} GB</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-gray-700 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${storageUsage.percentage}%` }}
                      transition={{ duration: 0.5 }}
                      className={cn(
                        'h-full rounded-full',
                        storageUsage.percentage > 90 
                          ? 'bg-gradient-to-r from-red-500 to-red-600'
                          : storageUsage.percentage > 70
                          ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                          : 'bg-gradient-to-r from-blue-500 to-purple-600'
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="hidden sm:flex items-center space-x-1">
              <button
                type="button"
                onClick={handleUpload}
                className="inline-flex items-center rounded-md px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-200 active:scale-[0.98]"
                aria-label="Subir archivos"
              >
                <Upload className="h-4 w -4 mr1.5" />
                <span>Subir</span>
              </button>
              
              <button
                type="button"
                onClick={handleNewFolder}
                className="inline-flex items-center rounded-md px-3 py -2 text-sm font-medium text-gray -300 bg-gray -800 hover:bg-gray -700 hover:text-white focus:outline-none focus:ring -2 focus:ring-blue -500 focus:ring-offset -2 focus:ring-offset-gray -900 transition-all duration -200 active:scale-[0.98]"
                aria-label="Nueva carpeta"
              >
                <FolderPlus className="h -4 w -4 mr1.5" />
                <span>Nueva</span>
              </button>
            </div>
            
            {/* Notifications */}
            <button
              type="button"
              className="relative rounded-full p -1.5 text-gray -400 hover:text-white hover:bg-gray -800 focus:outline-none focus:ring -2 focus:ring-blue -500"
              aria-label="Notificaciones"
            >
              <Bell className="h -5 w -5" />
              <span className="absolute top -0 right -0 block h -2 w -2 rounded-full bg-red -500 ring -2 ring-gray -900" />
            </button>
            
            {/* User menu */}
            <HeadlessMenu as="div" className="relative">
              <HeadlessMenu.Button
                className="flex items-center space-x -2 rounded-lg p -1.5 text-sm focus:outline-none focus:ring -2 focus:ring-blue -500 hover:bg-gray -800"
                aria-label="Menú de usuario"
              >
                <div className="h -8 w -8 rounded-full bg-gradient-to-br from-blue -500 to-purple -600 flex items-center justify-center">
                  {user?.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.avatar}
                      alt={user.name || 'Usuario'}
                      className="h-full w-full rounded-full objectcover"
                    />
                  ) : (
                    <User className="h -4 w -4 text-white" />
                  )}
                </div>
                <ChevronDown className="h -4 w -4 text-gray -400" />
              </HeadlessMenu.Button>
              
              <Transition
                as={React.Fragment}
                enter="transition ease-out duration100"
                enterFrom="transform opacity0 scale95"
                enterTo="transform opacity100 scale100"
                leave="transition ease-in duration75"
                leaveFrom="transform opacity100 scale100"
                leaveTo="transform opacity0 scale95"
              >
                <HeadlessMenu.Items className="absolute right0 mt2 w48 origin-top-right rounded-lg bg-gray -800 py1 shadow-lg ring1 ring-black ring-opacity5 focus:outline-none z50">
                  <div className="px4 py3 border-b border-gray700">
                    <p className="text-sm font-medium text-white">{user?.name || 'Usuario'}</p>
                    <p className="text-xs text-gray400 truncate">{user?.email || ''}</p>
                  </div>
                  
                  <HeadlessMenu.Item>
                    {({ active }) => (
                      <Link
                        href="/profile"
                        className={cn(
                          active ? 'bg-gray700 text-white' : 'text-gray300',
                          'block px4 py2 text-sm transition-colors duration150'
                        )}
                      >
                        Mi perfil
                      </Link>
                    )}
                  </HeadlessMenu.Item>
                  
                  <HeadlessMenu.Item>
                    {({ active }) => (
                      <Link
                        href="/settings"
                        className={cn(
                          active ? 'bg-gray700 text-white' : 'text-gray300',
                          'block px4 py2 text-sm transition-colors duration150'
                        )}
                      >
                        <Settings className="inline-block h4 w4 mr2" />
                        Configuración
                      </Link>
                    )}
                  </HeadlessMenu.Item>
                  
                  <HeadlessMenu.Item>
                    {({ active }) => (
                      <button
                        type="button"
                        onClick={handleLogout}
                        className={cn(
                          active ? 'bg-gray700 text-white' : 'text-gray300',
                          'block w-full text-left px4 py2 text-sm transition-colors duration150'
                        )}
                      >
                        <LogOut className="inline-block h4 w4 mr2" />
                        Cerrar sesión
                      </button>
                    )}
                  </HeadlessMenu.Item>
                </HeadlessMenu.Items>
              </Transition>
            </HeadlessMenu>
          </div>
        </div>
        
        {/* Mobile action buttons */}
        <AnimatePresence>
          {isScrolled && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="sm:hidden border-t border-gray800/50 pt3 mt3"
            >
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleUpload}
                  className="flex1 inline-flex items-center justify-center rounded-md px3 py2 text-sm font-medium text-white bg-gradient-to-r from-blue600 to-blue700 hover:from-blue500 hover:to-blue600 mx1"
                  aria-label="Subir archivos"
                >
                  <Upload className="h4 w4 mr1.5" />
                  Subir
                </button>
                
                <button
                  type="button"
                  onClick={handleNewFolder}
                  className="flex1 inline-flex items-center justify-center rounded-md px3 py2 text-sm font-medium text-gray300 bg-gray800 hover:bg-gray700 hover:text-white mx1"
                  aria-label="Nueva carpeta"
                >
                  <FolderPlus className="h4 w4 mr1.5" />
                  Nueva
                </button>
                
                <div className="flex1 mx1 px3 py2">
                  <div className="text-xs text-gray300 mb1 text-center">
                    {storageGBUsed} / {storageGBTotal} GB
                  </div>
                  <div className="h1 w-full rounded-full bg-gray700 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${storageUsage.percentage}%` }}
                      transition={{ duration: 0.5 }}
                      className={cn(
                        'h-full rounded-full',
                        storageUsage.percentage > 90 
                          ? 'bg-gradient-to-r from-red500 to-red600'
                          : storageUsage.percentage > 70
                          ? 'bg-gradient-to-r from-yellow500 to-yellow600'
                          : 'bg-gradient-to-r from-blue500 to-purple600'
                      )}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
});

export default Header;