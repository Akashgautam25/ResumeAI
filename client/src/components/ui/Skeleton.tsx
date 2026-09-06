import React from 'react';

export const Skeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', ...props }) => {
  return (
    <div
      className={`animate-pulse rounded-lg bg-zinc-200/80 ${className}`}
      {...props}
    />
  );
};
