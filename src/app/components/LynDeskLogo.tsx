import React from "react";

interface LynDeskLogoProps {
  className?: string;
  size?: number;
  variant?: "mark" | "full";
  showText?: boolean;
}

export default function LynDeskLogo({
  className = "",
  size = 29,
  variant = "mark",
  showText = false,
}: LynDeskLogoProps) {
  if (variant === "full" || showText) {
    return (
      <div className={`inline-flex items-center gap-2.5 ${className}`}>
        <svg
          width={size}
          height={size}
          viewBox="160 130 195 180"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="shrink-0 transition-transform duration-200 hover:scale-105"
        >
          {/* Vector 1: Main outer loop */}
          <path
            d="M235.5 254.499C235.5 254.499 188.497 296.002 180.998 299.001C173.5 302 167 295.5 169.5 285.5L210 139.999L348.5 299.001L209.5 299.001"
            className="stroke-txt-main"
            strokeWidth="12"
            strokeLinecap="square"
            strokeLinejoin="round"
          />
          {/* Vector 2: Diamond outer border (7px) */}
          <path
            d="M272.792 231.101L263.871 221.192C260.791 217.772 255.522 217.496 252.102 220.576L242.193 229.497C238.773 232.577 238.497 237.846 241.576 241.266L250.498 251.175C253.578 254.595 258.847 254.871 262.267 251.792L272.175 242.87C275.596 239.79 275.872 234.521 272.792 231.101Z"
            fill="none"
            className="stroke-txt-main"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Vector 3: Inner solid core diamond */}
          <path
            d="M263.295 234.4L259.457 230.138L257.553 228.007L255.272 230.047L250.74 234.128L249.007 235.702L254.886 242.232L256.695 244.241L258.415 242.652L262.947 238.571L265.241 236.546L263.295 234.4Z"
            className="fill-txt-main stroke-txt-main"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Vector 4: Right top angle bracket */}
          <path
            d="M286.124 203.419L281.544 207.295L289.295 216.455L293.876 212.58L290 208L286.124 203.419ZM306.876 201.58C309.405 199.439 309.721 195.653 307.58 193.124C305.44 190.594 301.654 190.279 299.124 192.419L303 197L306.876 201.58ZM290 208L293.876 212.58L306.876 201.58L303 197L299.124 192.419L286.124 203.419L290 208Z"
            className="fill-txt-main"
          />
          {/* Vector 5: Top right filled tip */}
          <path
            d="M281.295 187.994L313.354 188.448L308.912 220.201L281.295 187.994Z"
            className="fill-txt-main"
          />
          {/* Polygon 1: Accent triangle apex aligned with line top-left corner (203.5, 293) */}
          <path
            d="M203.5 293L210.928 305H188L203.5 293Z"
            className="fill-txt-main"
          />
        </svg>
        <div className="flex flex-col leading-none">
          <span className="font-display font-semibold tracking-tight text-txt-main text-lg">
            Lyndesk
          </span>
          <span className="font-mono text-[9px] text-txt-muted uppercase tracking-widest -mt-0.5">
            link your next desk
          </span>
        </div>
      </div>
    );
  }

  // Mark only
  return (
    <svg
      width={size}
      height={size}
      viewBox="160 130 195 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-transform duration-200 hover:scale-105 ${className}`}
    >
      {/* Vector 1 */}
      <path
        d="M235.5 254.499C235.5 254.499 188.497 296.002 180.998 299.001C173.5 302 167 295.5 169.5 285.5L210 139.999L348.5 299.001L209.5 299.001"
        className="stroke-txt-main"
        strokeWidth="12"
        strokeLinecap="square"
        strokeLinejoin="round"
      />
      {/* Vector 2 */}
      <path
        d="M272.792 231.101L263.871 221.192C260.791 217.772 255.522 217.496 252.102 220.576L242.193 229.497C238.773 232.577 238.497 237.846 241.576 241.266L250.498 251.175C253.578 254.595 258.847 254.871 262.267 251.792L272.175 242.87C275.596 239.79 275.872 234.521 272.792 231.101Z"
        fill="none"
        className="stroke-txt-main"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Vector 3 */}
      <path
        d="M263.295 234.4L259.457 230.138L257.553 228.007L255.272 230.047L250.74 234.128L249.007 235.702L254.886 242.232L256.695 244.241L258.415 242.652L262.947 238.571L265.241 236.546L263.295 234.4Z"
        className="fill-txt-main stroke-txt-main"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Vector 4 */}
      <path
        d="M286.124 203.419L281.544 207.295L289.295 216.455L293.876 212.58L290 208L286.124 203.419ZM306.876 201.58C309.405 199.439 309.721 195.653 307.58 193.124C305.44 190.594 301.654 190.279 299.124 192.419L303 197L306.876 201.58ZM290 208L293.876 212.58L306.876 201.58L303 197L299.124 192.419L286.124 203.419L290 208Z"
        className="fill-txt-main"
      />
      {/* Vector 5 */}
      <path
        d="M281.295 187.994L313.354 188.448L308.912 220.201L281.295 187.994Z"
        className="fill-txt-main"
      />
      {/* Polygon 1 */}
      <path
        d="M203.5 293L210.928 305H188L203.5 293Z"
        className="fill-txt-main"
      />
    </svg>
  );
}
