import React from 'react';

/**
 * Reusable loading spinner with optional full-screen overlay.
 */
export default function LoadingSpinner({ fullScreen = false, size = 'md', text = '' }) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-4',
  };

  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`${sizes[size]} border-gray-700 border-t-primary-500 rounded-full animate-spin`}
      />
      {text && <p className="text-sm text-gray-400">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-dark-200 flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      {spinner}
    </div>
  );
}
