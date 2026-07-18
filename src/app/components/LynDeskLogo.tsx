import React from "react";

interface LynDeskLogoProps {
  className?: string;
  size?: number;
}

export default function LynDeskLogo({ className = "", size = 24 }: LynDeskLogoProps) {
  const scaledSize = Math.round(size * 1.25);
  return (
    <img 
      src="/lyndesk-logo.jpg" 
      alt="LynDesk Logo" 
      width={scaledSize}
      height={scaledSize}
      className={`object-contain rounded-full border border-border-main/60 filter grayscale invert dark:invert-0 transition-all duration-150 ${className}`}
    />
  );
}
