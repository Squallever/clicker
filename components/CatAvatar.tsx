
import React, { useEffect, useState, useMemo } from 'react';
import { Upgrade } from '../types';

interface CatAvatarProps {
  onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  upgrades: Upgrade[];
  isFever: boolean;
  pps: number;
  feverMultiplier: number;
}

type IdleState = 'breathe' | 'stretching' | 'grooming' | 'playing';

export const CatAvatar: React.FC<CatAvatarProps> = ({ onClick, upgrades, isFever, pps, feverMultiplier }) => {
  const [isBlinking, setIsBlinking] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [idleState, setIdleState] = useState<IdleState>('breathe');
  
  const hasHat = upgrades.some(u => u.id === 'straw_hat' && u.count > 0);

  // Blinking logic
  useEffect(() => {
    const blinkLoop = () => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 200);
      const nextBlink = Math.random() * 4000 + 3000;
      setTimeout(blinkLoop, nextBlink);
    };
    const timeoutId = setTimeout(blinkLoop, 3000);
    return () => clearTimeout(timeoutId);
  }, []);

  // Idle state randomizer
  useEffect(() => {
    const changeState = () => {
      const states: IdleState[] = ['breathe', 'stretching', 'grooming', 'playing'];
      const weightedStates = [...states, 'breathe', 'breathe', 'breathe'];
      const nextState = weightedStates[Math.floor(Math.random() * weightedStates.length)];
      setIdleState(nextState as IdleState);
      const duration = nextState === 'breathe' ? 6000 : 3000;
      setTimeout(changeState, duration);
    };
    const timeoutId = setTimeout(changeState, 5000);
    return () => clearTimeout(timeoutId);
  }, []);

  const isExcited = pps > 50 || isFever || idleState === 'playing';

  const bodyAnimClass = useMemo(() => {
    if (isFever) return 'animate-[pulse_0.8s_infinite]';
    if (idleState === 'stretching') return 'animate-stretch';
    if (idleState === 'playing') return 'animate-head-tilt';
    return 'animate-breathe';
  }, [idleState, isFever]);

  const tailAnimClass = useMemo(() => {
    if (isFever || idleState === 'playing') return 'animate-tail-wag';
    return '';
  }, [idleState, isFever]);

  return (
    <div 
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      onClick={onClick}
      className={`cursor-pointer w-64 h-64 md:w-80 md:h-80 relative select-none transition-transform duration-75 ${isPressed ? 'scale-95' : 'scale-100'}`}
    >
      <div className={`w-full h-full transition-all duration-300 ${bodyAnimClass}`}>
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="overflow-visible">
          {/* Background Aura */}
          <circle 
            cx="100" cy="110" r="75" 
            fill={isFever ? "#ff9800" : "#e8f5e9"} 
            className="transition-colors duration-500"
            opacity={isFever ? "0.3" : "0.6"} 
          />
          
          {/* Tail */}
          <path 
            d="M160 130 C180 120 190 100 180 80" 
            stroke="#d4a373" strokeWidth="8" strokeLinecap="round" 
            fill="none"
            className={tailAnimClass}
          />
          
          {/* Ears - Rendered BEFORE the head so they appear naturally attached behind it */}
          {/* Made significantly smaller as requested */}
          <g>
            {/* Left Ear - Smaller, tip lowered to y=28, width reduced */}
            <path 
              d="M 42 80 Q 28 55 38 28 Q 65 38 85 48" 
              fill="#fff1cc" stroke="#d4a373" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" 
            />
            {/* Left Ear Inner */}
            <path d="M 48 72 Q 42 55 46 38 Q 65 50 75 58" fill="#ffab91" opacity="0.6" />
            
            {/* Right Ear - Smaller, tip lowered to y=28, width reduced */}
            <path 
              d="M 158 80 Q 172 55 162 28 Q 135 38 115 48" 
              fill="#fff1cc" stroke="#d4a373" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" 
            />
            {/* Right Ear Inner */}
            <path d="M 152 72 Q 158 55 154 38 Q 135 50 125 58" fill="#ffab91" opacity="0.6" />
          </g>

          {/* Body Base (Head) - Rendered AFTER ears to cover the attachment points */}
          <circle cx="100" cy="110" r="70" fill="#fff1cc" stroke="#d4a373" strokeWidth="2" />
          
          {/* Eyes - Fever mode eyes perfectly centered on default eye positions */}
          {isBlinking ? (
            <>
              <path d="M69 100 L81 100" stroke="#5d4037" strokeWidth="3" strokeLinecap="round" />
              <path d="M119 100 L131 100" stroke="#5d4037" strokeWidth="3" strokeLinecap="round" />
            </>
          ) : isFever ? (
            <>
              {/* Star eyes perfectly centered at 75,100 and 125,100 */}
              <g filter="drop-shadow(0 0 2px rgba(255,152,0,0.5))">
                <text 
                  x="75" y="100" 
                  fontSize="28" 
                  textAnchor="middle" 
                  dominantBaseline="central"
                  fill="#ff9800" 
                  stroke="#fff" 
                  strokeWidth="1.5"
                  style={{ pointerEvents: 'none' }}
                >✨</text>
                <text 
                  x="125" y="100" 
                  fontSize="28" 
                  textAnchor="middle" 
                  dominantBaseline="central"
                  fill="#ff9800" 
                  stroke="#fff" 
                  strokeWidth="1.5"
                  style={{ pointerEvents: 'none' }}
                >✨</text>
              </g>
            </>
          ) : (
            <>
              <circle cx="75" cy="100" r={isExcited ? "8" : "6"} fill="#5d4037" />
              <circle cx="125" cy="100" r={isExcited ? "8" : "6"} fill="#5d4037" />
              {isExcited && <circle cx="77" cy="98" r="2" fill="white" />}
              {isExcited && <circle cx="127" cy="98" r="2" fill="white" />}
            </>
          )}

          {/* Blush */}
          <ellipse cx="65" cy="115" rx="8" ry="5" fill="#ffab91" opacity="0.5" />
          <ellipse cx="135" cy="115" rx="8" ry="5" fill="#ffab91" opacity="0.5" />

          {/* Nose */}
          <path d="M96 115 L104 115 L100 120 Z" fill="#ff8a65" />

          {/* Mouth */}
          {isExcited ? (
             <path d="M90 125 Q100 135 110 125" stroke="#5d4037" strokeWidth="2" strokeLinecap="round" fill="none" />
          ) : (
            <>
              <path d="M100 120 Q90 130 80 122" stroke="#5d4037" strokeWidth="2" strokeLinecap="round" fill="none" />
              <path d="M100 120 Q110 130 120 122" stroke="#5d4037" strokeWidth="2" strokeLinecap="round" fill="none" />
            </>
          )}

          {/* Whiskers */}
          <g opacity="0.5">
            <line x1="65" y1="108" x2="40" y2="105" stroke="#5d4037" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="65" y1="114" x2="35" y2="114" stroke="#5d4037" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="65" y1="120" x2="40" y2="123" stroke="#5d4037" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="135" y1="108" x2="160" y2="105" stroke="#5d4037" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="135" y1="114" x2="165" y2="114" stroke="#5d4037" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="135" y1="120" x2="160" y2="123" stroke="#5d4037" strokeWidth="1.5" strokeLinecap="round" />
          </g>
          
          {/* Paw Swipe */}
          {idleState === 'grooming' && (
            <g className="animate-paw-swipe">
              <circle cx="140" cy="135" r="15" fill="#fff1cc" stroke="#d4a373" strokeWidth="1" />
              <circle cx="132" cy="125" r="4" fill="#ff8a65" />
              <circle cx="140" cy="123" r="4" fill="#ff8a65" />
              <circle cx="148" cy="125" r="4" fill="#ff8a65" />
              <circle cx="140" cy="137" r="7" fill="#ff8a65" />
            </g>
          )}

          {/* Straw Hat */}
          {hasHat && (
            <g transform="translate(100, 35) rotate(-5)">
              <ellipse cx="0" cy="20" rx="60" ry="15" fill="#f4d03f" stroke="#d35400" strokeWidth="1" />
              <path d="M-35 20 Q-40 -20 0 -25 Q40 -20 35 20" fill="#f4d03f" stroke="#d35400" strokeWidth="1" />
              <path d="M-36 15 Q0 22 36 15" stroke="#e74c3c" strokeWidth="6" fill="none" opacity="0.8" />
            </g>
          )}
        </svg>
      </div>
      
      <div className="absolute -bottom-8 w-full text-center">
        <span className={`inline-block px-6 py-2 rounded-full text-white font-bold shadow-lg text-sm tracking-wide transition-all transform hover:scale-110 ${isFever ? 'bg-gradient-to-r from-orange-400 to-red-500 animate-bounce' : 'bg-[#89c965]'}`}>
          {isFever ? `FEVER MODE x${feverMultiplier.toFixed(1)}!` : idleState === 'playing' ? 'Catch me!' : 'Collect Clover'}
        </span>
      </div>
    </div>
  );
};
