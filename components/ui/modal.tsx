'use client';

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
  initialFocusRef?: React.RefObject<HTMLElement>;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  className?: string;
  overlayClassName?: string;
  contentClassName?: string;
}

const Modal = React.memo(function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEsc = true,
  initialFocusRef,
  ariaLabel,
  ariaDescribedBy,
  className,
  overlayClassName,
  contentClassName,
}: ModalProps) {
  const [mounted, setMounted] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const lastFocusedElement = useRef<HTMLElement | null>(null);

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[95vw]',
  };

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape' && closeOnEsc) {
      onClose();
    }
    if (event.key === 'Tab' && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }, [onClose, closeOnEsc]);

  const handleOverlayClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      onClose();
    }
  }, [closeOnOverlayClick, onClose]);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      lastFocusedElement.current = document.activeElement as HTMLElement;
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeyDown);

      const timer = setTimeout(() => {
        if (initialFocusRef?.current) {
          initialFocusRef.current.focus();
        } else if (modalRef.current) {
          const focusableElements = modalRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusableElements.length > 0) {
            (focusableElements[0] as HTMLElement).focus();
          }
        }
      }, 50);

      return () => {
        clearTimeout(timer);
        document.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
      if (lastFocusedElement.current) {
        lastFocusedElement.current.focus();
      }
    }
  }, [isOpen, handleKeyDown, initialFocusRef]);

  if (!mounted) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'fixed inset-0 z-50 bg-black/70 backdrop-blur-sm',
              overlayClassName
            )}
            onClick={handleOverlayClick}
            aria-hidden="true"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              ref={modalRef}
              role="dialog"
              aria-modal="true"
              aria-label={ariaLabel || title}
              aria-describedby={ariaDescribedBy}
              className={cn(
                'relative w-full rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 shadow-2xl',
                sizeClasses[size],
                className
              )}
            >
              <div className="flex items-center justify-between border-b border-gray-700/50 p-6">
                <h2 className="text-xl font-semibold text-white">{title}</h2>
                {showCloseButton && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg p-2 text-gray-400 transition-all hover:bg-gray-700/50 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                    aria-label="Close modal"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
              <div className={cn('max-h-[80vh] overflow-y-auto p-6', contentClassName)}>
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
});

Modal.displayName = 'Modal';

export interface AlertModalProps extends Omit<ModalProps, 'children'> {
  variant?: 'success' | 'warning' | 'error' | 'info';
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  showCancel?: boolean;
}

export const AlertModal = React.memo(function AlertModal({
  variant = 'info',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  showCancel = true,
  ...modalProps
}: AlertModalProps) {
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  const variantConfig = {
    success: {
      icon: CheckCircle2,
      iconColor: 'text-green-400',
      bgColor: 'bg-green-400/10',
      buttonColor: 'bg-green-500 hover:bg-green-600 focus:ring-green-500',
    },
    warning: {
      icon: AlertCircle,
      iconColor: 'text-yellow-400',
      bgColor: 'bg-yellow-400/10',
      buttonColor: 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-500',
    },
    error: {
      icon: AlertCircle,
      iconColor: 'text-red-400',
      bgColor: 'bg-red-400/10',
      buttonColor: 'bg-red-500 hover:bg-red-600 focus:ring-red-500',
    },
    info: {
      icon: AlertCircle,
      iconColor: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
      buttonColor: 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-500',
    },
  };

  const { icon: Icon, iconColor, bgColor, buttonColor } = variantConfig[variant];

  const handleConfirm = () => {
    onConfirm?.();
    modalProps.onClose();
  };

  const handleCancel = () => {
    onCancel?.();
    modalProps.onClose();
  };

  return (
    <Modal {...modalProps} initialFocusRef={confirmButtonRef}>
      <div className="space-y-6">
        <div className={`flex items-start gap-4 rounded-lg ${bgColor} p-4`}>
          <Icon className={`mt-0.5 h-6 w-6 flex-shrink-0 ${iconColor}`} />
          <p className="text-sm text-gray-300">{message}</p>
        </div>
        <div className="flex justify-end gap-3">
          {showCancel && (
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              {cancelText}
            </button>
          )}
          <button
            ref={confirmButtonRef}
            type="button"
            onClick={handleConfirm}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 ${buttonColor}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
});

AlertModal.displayName = 'AlertModal';

export default Modal;