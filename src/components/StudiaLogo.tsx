import React from 'react';

interface StudiaLogoProps {
  width?: number;
  height?: number;
  className?: string;
  variant?: 'light' | 'dark';
}

export default function StudiaLogo({ width = 190, height = 54, className = '', variant = 'light' }: StudiaLogoProps) {
  const textColor = variant === 'dark' ? '#ffffff' : '#1e3a8a';
  const subtextColor = variant === 'dark' ? '#93c5fd' : '#2563eb';
  const bookColor = '#1d4ed8';
  const waveLight = '#93c5fd';
  const waveDark = '#3b82f6';

  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 240 68" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={`inline-block select-none ${className}`}
    >
      {/* Wave Flourish */}
      <path 
        d="M60 22C95 6, 135 38, 178 30C205 24, 222 14, 238 18" 
        stroke={waveLight} 
        strokeWidth="2.8" 
        strokeLinecap="round" 
        fill="none" 
        opacity="0.85"
      />
      <path 
        d="M175 14C198 8, 218 16, 238 18" 
        stroke={waveLight} 
        strokeWidth="4.2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        fill="none" 
        opacity="0.35"
      />
      <path 
        d="M142 32C154 39, 172 32, 168 22C164 15, 151 17, 146 25" 
        stroke={waveDark} 
        strokeWidth="2" 
        strokeLinecap="round" 
        fill="none" 
        opacity="0.9"
      />

      {/* Book Icon on Top of "di" */}
      <g transform="translate(62, 5)">
        <path d="M14 13C14 6, 23 3.5, 27 7L27 21C23 17, 14 17.5, 14 20Z" fill={bookColor} />
        <path d="M40 13C40 6, 31 3.5, 27 7L27 21C31 17, 40 17.5, 40 20Z" fill="#1e40af" />
        <path d="M17 15C17 12, 22 9.5, 25 11L25 19" stroke="white" strokeWidth="0.8" opacity="0.5" fill="none"/>
        <path d="M37 15C37 12, 32 9.5, 29 11L29 19" stroke="white" strokeWidth="0.8" opacity="0.5" fill="none"/>
      </g>

      {/* Brand Name "Studia" */}
      <text 
        x="6" 
        y="48" 
        fontFamily="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
        fontWeight="800" 
        fontSize="36" 
        fill={textColor} 
        letterSpacing="-1.2"
      >
        Studia
      </text>

      {/* Subtitle "GRADE ESCOLAR DIGITAL" */}
      <text 
        x="8" 
        y="60" 
        fontFamily="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
        fontWeight="700" 
        fontSize="8.5" 
        fill={subtextColor} 
        letterSpacing="1.2"
      >
        GRADE ESCOLAR DIGITAL
      </text>
    </svg>
  );
}
