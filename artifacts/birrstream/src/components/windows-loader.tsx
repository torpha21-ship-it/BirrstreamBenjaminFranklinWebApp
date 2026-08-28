import React from "react";

interface WindowsLoaderProps {
  size?: number;
  fullScreen?: boolean;
  text?: string;
  className?: string;
}

export function WindowsLoader({
  size = 54,
  fullScreen = false,
  text,
  className = "",
}: WindowsLoaderProps) {
  const loaderEl = (
    <div className={`flex flex-col items-center justify-center gap-5 select-none ${className}`}>
      <div
        className="relative flex items-center justify-center"
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        <div
          className="win-loader"
          style={{ width: `${size}px`, height: `${size}px` }}
        >
          {/* Box 1: Total Yield (Warm Yellow #F5E6A3) */}
          <div className="win-loader-square win-sq-1" />
          {/* Box 2: Total Deposited (Lavender Purple #C9BDF5) */}
          <div className="win-loader-square win-sq-2" />
          {/* Box 3: Total Withdrawn (Soft Coral #F2A89A) */}
          <div className="win-loader-square win-sq-3" />
          {/* Box 4: Reserve Floor (Soft Mint #A8D5B5) */}
          <div className="win-loader-square win-sq-4" />
        </div>
      </div>
      {text && (
        <p className="text-xs font-semibold tracking-wider uppercase text-muted-foreground animate-pulse">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/90 backdrop-blur-md">
        {loaderEl}
      </div>
    );
  }

  return loaderEl;
}
