import React from 'react';
import { CAR_THEMES } from '../data/constants';

export function CarSvg({ colorScheme = 'cyan', isUserCar = false }) {
  const t = CAR_THEMES[colorScheme] || CAR_THEMES.cyan;
  const gradId = `bodyGrad-${colorScheme}-${isUserCar ? 'user' : 'other'}`;

  return (
    <svg className="w-16 h-28 mx-auto transition-transform duration-300" viewBox="0 0 72 130" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={t.mid} />
          <stop offset="100%" stopColor={t.primary} />
        </linearGradient>
      </defs>

      {/* Wheels / Tires */}
      <rect x="2" y="16" width="7" height="18" rx="2" fill="#090d16" stroke="#334155" strokeWidth="1" />
      <rect x="63" y="16" width="7" height="18" rx="2" fill="#090d16" stroke="#334155" strokeWidth="1" />
      <rect x="2" y="92" width="7" height="18" rx="2" fill="#090d16" stroke="#334155" strokeWidth="1" />
      <rect x="63" y="92" width="7" height="18" rx="2" fill="#090d16" stroke="#334155" strokeWidth="1" />

      {/* Chassis Shadow */}
      <rect x="6" y="8" width="60" height="114" rx="16" fill="rgba(0,0,0,0.55)" filter="blur(3px)" />

      {/* Main Body */}
      <rect 
        x="7" 
        y="6" 
        width="58" 
        height="116" 
        rx="16" 
        fill={`url(#${gradId})`} 
        stroke={isUserCar ? '#38bdf8' : t.trim} 
        strokeWidth={isUserCar ? '2' : '1.2'} 
      />

      {/* Side Mirrors */}
      <path d="M4 42 C1 42 1 48 7 48 Z" fill={t.mid} />
      <path d="M68 42 C71 42 71 48 65 48 Z" fill={t.mid} />

      {/* Hood Aerodynamic Ridges */}
      <path d="M22 10 L26 34" stroke={t.light} strokeWidth="1" strokeLinecap="round" opacity="0.6" />
      <path d="M50 10 L46 34" stroke={t.light} strokeWidth="1" strokeLinecap="round" opacity="0.6" />

      {/* Front Windshield */}
      <path d="M14 36 C14 30 58 30 58 36 L54 52 L18 52 Z" fill="#0f172a" stroke="#64748b" strokeWidth="1" />

      {/* Panoramic Sunroof / Cockpit */}
      <rect x="18" y="54" width="36" height="34" rx="5" fill="#020617" stroke={t.light} strokeWidth="0.8" />

      {/* Rear Windshield */}
      <path d="M18 90 L54 90 L58 104 C58 110 14 110 14 104 Z" fill="#0f172a" stroke="#64748b" strokeWidth="1" />

      {/* Xenon Headlights */}
      <polygon points="10,12 20,10 16,18 10,16" fill="#38bdf8" />
      <polygon points="62,12 52,10 56,18 62,16" fill="#38bdf8" />

      {/* Taillights */}
      <rect x="10" y="116" width="12" height="4" rx="1.5" fill="#ef4444" />
      <rect x="50" y="116" width="12" height="4" rx="1.5" fill="#ef4444" />

      {/* User Car Beacon Indicator */}
      {isUserCar && (
        <g>
          <circle cx="36" cy="65" r="14" fill="none" stroke="#22d3ee" strokeWidth="2" className="beacon-pulse" opacity="0.8" />
          <circle cx="36" cy="65" r="5" fill="#22d3ee" />
        </g>
      )}
    </svg>
  );
}
