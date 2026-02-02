'use client';

'use client';

import React, { forwardRef, memo, useCallback, useState } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const cardVariants = cva(
  'rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-300',
  {
    variants: {
      variant: {
        default: 'border-border bg-gradient-to-br from-gray-900 to-gray-950',
        elevated: 'border-border/50 bg-gradient-to-br from-gray-800 to-gray-900 shadow-lg',
        interactive: 'border-border bg-gradient-to-br from-gray-900 to-gray-950 hover:from-gray-800 hover:to-gray-900 hover:shadow-md cursor-pointer',
        selected: 'border-primary/30 bg-gradient-to-br from-primary/10 to-gray-900 ring-1 ring-primary/20',
        destructive: 'border-destructive/30 bg-gradient-to-br from-destructive/10 to-gray-900',
      },
      size: {
        default: 'p-6',
        sm: 'p-4',
        lg: 'p-8',
        none: 'p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  asChild?: boolean;
  disabled?: boolean;
  loading?: boolean;
  selected?: boolean;
  dragOver?: boolean;
}

const Card = memo(
  forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant, size, disabled, loading, selected, dragOver, children, ...props }, ref) => {
      const computedVariant = selected ? 'selected' : dragOver ? 'interactive' : variant;
      
      return (
        <motion.div
          ref={ref}
          className={cn(
            cardVariants({ variant: computedVariant, size, className }),
            disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
            loading && 'animate-pulse',
            dragOver && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
          )}
          whileHover={!disabled ? { scale: 1.01 } : undefined}
          whileTap={!disabled ? { scale: 0.98 } : undefined}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          aria-disabled={disabled}
          aria-busy={loading}
          {...props}
        >
          {children}
        </motion.div>
      );
    }
  )
);
Card.displayName = 'Card';

const CardHeader = memo(
  forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
      <div
        ref={ref}
        className={cn('flex flex-col space-y-1.5 p-6 pb-3', className)}
        {...props}
      />
    )
  )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = memo(
  forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
    ({ className, children, ...props }, ref) => (
      <h3
        ref={ref}
        className={cn(
          'text-xl font-semibold leading-none tracking-tight text-foreground',
          className
        )}
        {...props}
      >
        {children}
      </h3>
    )
  )
);
CardTitle.displayName = 'CardTitle';

const CardDescription = memo(
  forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
    ({ className, ...props }, ref) => (
      <p
        ref={ref}
        className={cn('text-sm text-muted-foreground', className)}
        {...props}
      />
    )
  )
);
CardDescription.displayName = 'CardDescription';

const CardContent = memo(
  forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
      <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
    )
  )
);
CardContent.displayName = 'CardContent';

const CardFooter = memo(
  forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
      <div
        ref={ref}
        className={cn('flex items-center p-6 pt-3', className)}
        {...props}
      />
    )
  )
);
CardFooter.displayName = 'CardFooter';

interface CardActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

const CardAction = memo(
  forwardRef<HTMLButtonElement, CardActionProps>(
    ({ className, variant = 'default', children, ...props }, ref) => {
      const baseStyles = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background';
      
      const variantStyles = {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      };

      return (
        <button
          ref={ref}
          className={cn(baseStyles, variantStyles[variant], className)}
          {...props}
        >
          {children}
        </button>
      );
    }
  )
);
CardAction.displayName = 'CardAction';

interface FileCardProps extends CardProps {
  fileType?: 'image' | 'document' | 'video' | 'audio' | 'folder' | 'other';
  fileName: string;
  fileSize?: string;
  modifiedDate?: string;
  selected?: boolean;
  onSelect?: (selected: boolean) => void;
}

const FileCard = memo(
  forwardRef<HTMLDivElement, FileCardProps>(
    ({ 
      fileType = 'other', 
      fileName, 
      fileSize, 
      modifiedDate, 
      selected = false,
      onSelect,
      className,
      ...props 
    }, ref) => {
      
      const getFileIcon = useCallback(() => {
        switch (fileType) {
          case 'image':
            return <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">🖼️</div>;
          case 'document':
            return <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">📄</div>;
          case 'video':
            return <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center">🎬</div>;
          case 'audio':
            return <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">🎵</div>;
          case 'folder':
            return <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center">📁</div>;
          default:
            return <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg flex items-center justify-center">📎</div>;
        }
      }, [fileType]);

      const handleClick = useCallback((e: React.MouseEvent) => {
        if (onSelect) {
          onSelect(!selected);
        }
        props.onClick?.(e);
      }, [onSelect, selected, props]);

      return (
        <Card
          ref={ref}
          variant={selected ? 'selected' : 'interactive'}
          selected={selected}
          className={cn('relative overflow-hidden', className)}
          onClick={handleClick}
          role="button"
          tabIndex={0}
          aria-label={`${fileName} file${selected ? ', selected' : ''}`}
          aria-selected={selected}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleClick(e as any);
            }
          }}
          {...props}
        >
          <div className="flex flex-col items-center space-y-3">
            <div className="relative">
              {getFileIcon()}
              {selected && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
              )}
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-medium truncate max-w-[120px]" title={fileName}>
                {fileName}
              </p>
              {(fileSize || modifiedDate) && (
                <div className="text-xs text-muted-foreground space-y-0.5">
                  {fileSize && <p>{fileSize}</p>}
                  {modifiedDate && <p>{modifiedDate}</p>}
                </div>
              )}
            </div>
          </div>
        </Card>
      );
    }
  )
);
FileCard.displayName = 'FileCard';

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  CardAction,
  FileCard,
};