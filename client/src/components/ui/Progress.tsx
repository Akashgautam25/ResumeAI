import React from 'react';

export interface ProgressProps {
  value: number; // 0 to 100
  max?: number;
  className?: string;
  indicatorClassName?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  className = '',
  indicatorClassName = '',
  size = 'md',
  showLabel = false,
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className="w-full space-y-1">
      {showLabel && (
        <div className="flex justify-between text-xs text-zinc-500 font-medium">
          <span>Progress</span>
          <span>{percentage}%</span>
        </div>
      )}
      <div className={`w-full overflow-hidden rounded-full bg-zinc-100 border border-zinc-200/60 ${sizeClasses[size]} ${className}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 bg-zinc-900 ${indicatorClassName}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
