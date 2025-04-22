import React, { createContext, useContext, useState } from 'react';

type AvatarContextValue = {
  imageLoadingStatus: 'loading' | 'loaded' | 'error';
  setImageLoadingStatus: (status: 'loading' | 'loaded' | 'error') => void;
  size: 'sm' | 'md' | 'lg' | 'xl';
  shape: 'circle' | 'square';
};

const AvatarContext = createContext<AvatarContextValue | undefined>(undefined);

const useAvatar = () => {
  const context = useContext(AvatarContext);
  if (!context) {
    throw new Error('useAvatar must be used within an Avatar');
  }
  return context;
};

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'circle' | 'square';
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
};

const shapeClasses = {
  circle: 'rounded-full',
  square: 'rounded-md',
};

export function Avatar({
  className = '',
  children,
  size = 'md',
  shape = 'circle',
  ...props
}: AvatarProps) {
  const [imageLoadingStatus, setImageLoadingStatus] = useState<'loading' | 'loaded' | 'error'>(
    'loading'
  );

  return (
    <AvatarContext.Provider value={{ imageLoadingStatus, setImageLoadingStatus, size, shape }}>
      <div
        className={`relative flex shrink-0 overflow-hidden ${sizeClasses[size]} ${shapeClasses[shape]} ${className}`}
        {...props}
      >
        {children}
      </div>
    </AvatarContext.Provider>
  );
}

interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  className?: string;
  src: string;
  alt?: string;
}

export function AvatarImage({ className = '', src, alt = '', ...props }: AvatarImageProps) {
  const { setImageLoadingStatus } = useAvatar();

  return (
    <img
      src={src}
      alt={alt}
      className={`aspect-square h-full w-full object-cover ${className}`}
      onLoad={() => setImageLoadingStatus('loaded')}
      onError={() => setImageLoadingStatus('error')}
      {...props}
    />
  );
}

interface AvatarFallbackProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children?: React.ReactNode;
  delayMs?: number;
}

export function AvatarFallback({
  className = '',
  children,
  delayMs = 600,
  ...props
}: AvatarFallbackProps) {
  const { imageLoadingStatus, size, shape } = useAvatar();
  const [isDelayComplete, setIsDelayComplete] = useState(delayMs === 0);

  React.useEffect(() => {
    if (delayMs === 0) return;
    
    const timer = setTimeout(() => {
      setIsDelayComplete(true);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [delayMs]);

  if (imageLoadingStatus === 'loaded' || (imageLoadingStatus === 'loading' && !isDelayComplete)) {
    return null;
  }

  const bgColorClasses = {
    sm: 'bg-gray-100',
    md: 'bg-gray-100',
    lg: 'bg-gray-100',
    xl: 'bg-gray-100',
  };

  return (
    <div
      className={`absolute inset-0 flex h-full w-full items-center justify-center ${bgColorClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
} 