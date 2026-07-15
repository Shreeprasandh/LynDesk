import React from "react";

interface LynDeskLogoProps {
  className?: string;
  size?: number;
}

export default function LynDeskLogo({ className = "", size = 24 }: LynDeskLogoProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`text-txt-main transition-colors duration-150 ${className}`}
    >
      {/* Outer aesthetic circle */}
      <circle cx="50" cy="50" r="44" strokeWidth="4.5" className="stroke-txt-main" />

      {/* Left side: Open Book */}
      {/* Page crease (center axis) */}
      <line x1="50" y1="30" x2="50" y2="70" strokeWidth="4" className="stroke-txt-main" />
      {/* Page top curve */}
      <path d="M 50 30 C 36 30, 24 35, 18 45" strokeWidth="4" className="stroke-txt-main" />
      {/* Page bottom curve */}
      <path d="M 50 70 C 36 70, 24 65, 18 55" strokeWidth="4" className="stroke-txt-main" />
      {/* Page outer edge */}
      <line x1="18" y1="45" x2="18" y2="55" strokeWidth="4" className="stroke-txt-main" />

      {/* Right side: Laptop */}
      {/* Laptop Screen bezel */}
      <rect x="58" y="34" width="22" height="16" rx="1.5" strokeWidth="4" className="stroke-txt-main" />
      {/* Laptop Keyboard Base deck */}
      <path d="M 54 54 L 84 54 L 80 66 L 58 66 Z" strokeWidth="4" className="fill-none stroke-txt-main" />
    </svg>
  );
}
