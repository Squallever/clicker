import React, { useEffect, useState } from 'react';
import { Upgrade } from '../types';

interface CatAvatarProps {
  onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  upgrades: Upgrade[];
}

export const CatAvatar: React.FC<CatAvatarProps> = ({ onClick, upgrades }) => {
  const [isBlinking, setIsBlinking] = useState(false);
  const hasHat = upgrades.some(u => u.id === 'straw_hat' && u.count > 0);

  // Blinking logic
  useEffect(() => {
    const blinkLoop = () => {
      // Blink duration
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 200);

      // Random next blink between 3 and 7 seconds
      const nextBlink = Math.random() * 4000 + 3000;
      setTimeout(blinkLoop, nextBlink);
    };

    const timeoutId = setTimeout(blinkLoop, 3000);
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div 
      onClick={onClick}
      className="cursor-pointer w-64 h-64 md:w-80 md:h-80 relative select-none group"
    >
      <div className="click-anim animate-breathe w-full h-full transition-transform group-hover:scale-105">
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Background Aura - Soft Green */}
          <circle cx="100" cy="110" r="75" fill="#e8f5e9" opacity="0.6" />
          
          {/* Tail (Wagging slightly via CSS/SVG anim? Keeping static for simplicity inside breathe) */}
          <path d="M160 130 C180 120 190 100 180 80" stroke="#d4a373" strokeWidth="8" strokeLinecap="round" />
          
          {/* Body Base (White) */}
          <circle cx="100" cy="110" r="70" fill="#fdfdfd" stroke="#e5e5e5" strokeWidth="1" />
          
          {/* Calico Patches (Orange/Brown) */}
          <path d="M130 50 Q160 60 150 90 L120 70 Z" fill="#d4a373" opacity="0.9" />
          <path d="M40 80 Q50 40 80 60 L60 90 Z" fill="#5d5555" opacity="0.8" />

          {/* Ears */}
          <path d="M50 70 L30 30 L80 60 Z" fill="#fdfdfd" stroke="#d6d3d1" strokeWidth="3" strokeLinejoin="round" />
          <path d="M150 70 L170 30 L120 60 Z" fill="#d4a373" stroke="#d4a373" strokeWidth="3" strokeLinejoin="round" />
          
          {/* Inner Ears */}
          <path d="M45 60 L38 40 L65 55 Z" fill="#ffe4e1" />
          <path d="M155 60 L162 40 L135 55 Z" fill="#ffe4e1" />

          {/* Eyes (Dynamic Blinking) */}
          {isBlinking ? (
            <>
              {/* Closed Eyes */}
              <path d="M69 100 L81 100" stroke="#4a4a4a" strokeWidth="2" strokeLinecap="round" />
              <path d="M119 100 L131 100" stroke="#4a4a4a" strokeWidth="2" strokeLinecap="round" />
            </>
          ) : (
            <>
              {/* Open Eyes */}
              <circle cx="75" cy="100" r="6" fill="#4a4a4a" />
              <circle cx="125" cy="100" r="6" fill="#4a4a4a" />
            </>
          )}

          {/* Blush */}
          <ellipse cx="65" cy="115" rx="8" ry="5" fill="#ffcdd2" opacity="0.6" />
          <ellipse cx="135" cy="115" rx="8" ry="5" fill="#ffcdd2" opacity="0.6" />

          {/* Nose */}
          <path d="M96 115 L104 115 L100 120 Z" fill="#ffa07a" />

          {/* Mouth */}
          <path d="M100 120 Q90 130 80 122" stroke="#4a4a4a" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M100 120 Q110 130 120 122" stroke="#4a4a4a" strokeWidth="2" strokeLinecap="round" fill="none" />

          {/* Whiskers */}
          <line x1="135" y1="110" x2="160" y2="108" stroke="#a8a29e" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="135" y1="118" x2="165" y2="120" stroke="#a8a29e" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="65" y1="110" x2="40" y2="108" stroke="#a8a29e" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="65" y1="118" x2="35" y2="120" stroke="#a8a29e" strokeWidth="1.5" strokeLinecap="round" />
          
          {/* Paws holding a Four-Leaf Clover */}
          <circle cx="85" cy="160" r="14" fill="#fdfdfd" stroke="#e5e5e5" strokeWidth="2" />
          <circle cx="115" cy="160" r="14" fill="#fdfdfd" stroke="#e5e5e5" strokeWidth="2" />
          
          {/* Clover */}
          <g transform="translate(100, 155) scale(0.8)">
              <path d="M0 0 C-10 -10 -20 0 0 20 C20 0 10 -10 0 0" fill="#89c965" />
              <path d="M0 0 C-10 10 -20 0 0 -20 C20 0 10 10 0 0" fill="#89c965" />
              <path d="M0 20 L0 30" stroke="#689f38" strokeWidth="3" />
          </g>

          {/* Straw Hat Accessory (Conditional) */}
          {hasHat && (
            <g transform="translate(100, 35) rotate(-5)">
              {/* Hat Brim */}
              <ellipse cx="0" cy="20" rx="60" ry="15" fill="#f4d03f" stroke="#d35400" strokeWidth="1" />
              {/* Hat Top */}
              <path d="M-35 20 Q-40 -20 0 -25 Q40 -20 35 20" fill="#f4d03f" stroke="#d35400" strokeWidth="1" />
              {/* Hat Ribbon */}
              <path d="M-36 15 Q0 22 36 15" stroke="#e74c3c" strokeWidth="6" fill="none" opacity="0.8" />
            </g>
          )}

        </svg>
      </div>
      
      <div className="absolute -bottom-8 w-full text-center">
        <span className="inline-block bg-[#89c965]/90 px-5 py-2 rounded-full text-white font-bold shadow-sm text-sm tracking-wide transition-all transform group-hover:scale-110 group-hover:bg-[#7cb342]">
          Collect Clover
        </span>
      </div>
    </div>
  );
};