import React from 'react';

interface GeometricLogoProps {
  size?: number;
  className?: string;
}

export const GeometricLogo: React.FC<GeometricLogoProps> = ({ size = 28, className = '' }) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative flex items-center justify-center shrink-0 ${className}`}
      aria-label="CyberGuard AI lock mark"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transform transition-transform hover:scale-105 duration-200"
      >
        <defs>
          <linearGradient id="lock-body-grad" x1="5" y1="12" x2="27" y2="29" gradientUnits="userSpaceOnUse">
            <stop stopColor="#625FEF" />
            <stop offset="1" stopColor="#4F46E5" />
          </linearGradient>
          <linearGradient id="lock-shackle-grad" x1="10" y1="3" x2="22" y2="13" gradientUnits="userSpaceOnUse">
            <stop stopColor="#7B78F2" />
            <stop offset="1" stopColor="#625FEF" />
          </linearGradient>
          <filter id="lock-glow" x="2" y="2" width="28" height="28" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#625FEF" floodOpacity="0.2" />
          </filter>
        </defs>

        <g filter="url(#lock-glow)">
          {/* Shackle: Curved arched top with precise stroke */}
          <path
            d="M10.5 13.5V9C10.5 5.96243 12.9624 3.5 16 3.5C19.0376 3.5 21.5 5.96243 21.5 9V13.5"
            stroke="url(#lock-shackle-grad)"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Lock Body: Sleek rounded rectangle */}
          <rect
            x="5.5"
            y="12.5"
            width="21"
            height="15"
            rx="4.5"
            fill="url(#lock-body-grad)"
          />

          {/* Subtle inner highlight rim */}
          <rect
            x="6.75"
            y="13.75"
            width="18.5"
            height="12.5"
            rx="3.25"
            stroke="#A5B4FC"
            strokeWidth="0.8"
            strokeOpacity="0.4"
          />

          {/* Modern Keyhole: Circle + vertical notch */}
          <circle cx="16" cy="18.25" r="1.8" fill="#FFFFFF" fillOpacity="0.95" />
          <path
            d="M15.2 18.8L14.7 22.2C14.65 22.55 14.92 22.85 15.28 22.85H16.72C17.08 22.85 17.35 22.55 17.3 22.2L16.8 18.8H15.2Z"
            fill="#FFFFFF"
            fillOpacity="0.95"
          />
        </g>
      </svg>
    </div>
  );
};
