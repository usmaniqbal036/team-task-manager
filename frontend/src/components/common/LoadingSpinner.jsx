import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ size = 'md', label = 'Loading...', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-2.5 p-6 ${className}`}>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-indigo-600`} />
      {label && <span className="text-sm font-medium text-slate-500">{label}</span>}
    </div>
  );
};
