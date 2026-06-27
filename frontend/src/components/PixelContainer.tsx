import React from 'react';

interface PixelContainerProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  isDark?: boolean;
}

export const PixelContainer: React.FC<PixelContainerProps> = ({
  title,
  children,
  className = "",
  isDark = true,
}) => {
  return (
    <div className={`nes-container with-title ${isDark ? 'is-dark' : ''} ${className} relative my-6`}>
      {title && <p className="title text-sm md:text-base font-bold text-[#f4a261] px-2 bg-[#121212]">{title}</p>}
      {children}
    </div>
  );
};
