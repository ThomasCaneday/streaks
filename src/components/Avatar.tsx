import { type ReactNode } from 'react';

interface AvatarProps {
  src?: string;
  alt?: string;
  fallback?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Avatar({
  src,
  alt = 'Avatar',
  fallback,
  size = 'md',
  className = ''
}: AvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };
  
  return (
    <div className={`rounded-full overflow-hidden bg-gray-300 dark:bg-gray-600 flex items-center justify-center ${sizeClasses[size]} ${className}`}>
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        fallback || <span className="text-gray-600 dark:text-gray-300 text-sm font-semibold">?</span>
      )}
    </div>
  );
}
