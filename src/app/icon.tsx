import { ImageResponse } from "next/og";

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

// Icon generation
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: "transparent",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#0F0F0F", // Dark charcoal color, or we can use custom color
        }}
      >
        <svg
          viewBox="0 0 100 100"
          width="32"
          height="32"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Outer circle */}
          <circle cx="50" cy="50" r="44" strokeWidth="7" />

          {/* Left side: Open Book */}
          <line x1="50" y1="30" x2="50" y2="70" strokeWidth="6" />
          <path d="M 50 30 C 36 30, 24 35, 18 45" strokeWidth="6" />
          <path d="M 50 70 C 36 70, 24 65, 18 55" strokeWidth="6" />
          <line x1="18" y1="45" x2="18" y2="55" strokeWidth="6" />

          {/* Right side: Laptop */}
          <rect x="58" y="34" width="22" height="16" rx="2" strokeWidth="6" />
          <path d="M 54 54 L 84 54 L 80 66 L 58 66 Z" strokeWidth="6" />
        </svg>
      </div>
    ),
    // ImageResponse options
    {
      ...size,
    }
  );
}
