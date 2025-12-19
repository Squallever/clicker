
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Upgrade } from '../types';

interface CatAvatarProps {
  onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  onStroke: (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => void;
  upgrades: Upgrade[];
  isFever: boolean;
  pps: number;
  feverMultiplier: number;
  canPet: boolean;
}

type IdleState = 'breathe' | 'stretching' | 'grooming' | 'playing';

interface HeartParticle {
  id: number;
  x: number;
  y: number;
}

interface Ripple {
  id: number;
  x: number;
  y: number;
}

export const CatAvatar: React.FC<CatAvatarProps> = ({ onClick, onStroke, upgrades, isFever, pps, feverMultiplier, canPet }) => {
  const [isBlinking, setIsBlinking] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isGrabbing, setIsGrabbing] = useState(false); // Controls the cursor style (Palm)
  const [idleState, setIdleState] = useState<IdleState>('breathe');
  const [hearts, setHearts] = useState<HeartParticle[]>([]);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  
  // Refs for throttling stroke events and cursor logic
  const lastStrokeTime = useRef<number>(0);
  const strokeDistance = useRef<number>(0);
  const lastMousePos = useRef<{x: number, y: number} | null>(null);
  
  // Refs for cursor delay/drag logic
  const pressTimer = useRef<any>(null);
  const startDragPos = useRef<{x: number, y: number} | null>(null);

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

  // Mouse Down Handler: Starts the timer for "Grab" cursor
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsPressed(true);
    startDragPos.current = { x: e.clientX, y: e.clientY };
    
    // Only change to "Palm" cursor if held down for 150ms
    if (pressTimer.current) clearTimeout(pressTimer.current);
    pressTimer.current = setTimeout(() => {
      setIsGrabbing(true);
    }, 150);
  };

  // Mouse Up Handler: Resets states and adds Ripple effect
  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    // Add ripple effect
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newRipple = { id: Date.now() + Math.random(), x, y };
    setRipples(prev => [...prev, newRipple]);
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 600); // Match animation duration

    setIsPressed(false);
    setIsGrabbing(false);
    if (pressTimer.current) clearTimeout(pressTimer.current);
    startDragPos.current = null;
  };

  // Handle Stroking Logic
  const handleMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    // Only allow petting if pressed (for mouse) or always for touch (implicit)
    const isTouch = 'touches' in e;
    if (!isTouch && !isPressed) return;

    let clientX, clientY;
    if ('touches' in e) {
       clientX = e.touches[0].clientX;
       clientY = e.touches[0].clientY;
    } else {
       clientX = (e as React.MouseEvent).clientX;
       clientY = (e as React.MouseEvent).clientY;
    }

    // Logic to switch to "Grab" cursor immediately if dragged
    if (isPressed && !isGrabbing && !isTouch && startDragPos.current) {
      const dx = clientX - startDragPos.current.x;
      const dy = clientY - startDragPos.current.y;
      // If moved more than 10px, assume it's a pet/drag action, not a click
      if (Math.sqrt(dx * dx + dy * dy) > 10) {
        setIsGrabbing(true);
        if (pressTimer.current) clearTimeout(pressTimer.current);
      }
    }

    if (!canPet) return;

    const now = Date.now();
    
    if (lastMousePos.current) {
      // Calculate distance moved for stroke mechanism
      const dx = clientX - lastMousePos.current.x;
      const dy = clientY - lastMousePos.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      strokeDistance.current += dist;

      // Threshold: Must move at least 20px total and 50ms must have passed since last register
      if (strokeDistance.current > 20 && now - lastStrokeTime.current > 50) {
        onStroke(e);
        lastStrokeTime.current = now;
        strokeDistance.current = 0;

        // Add visual heart
        const rect = e.currentTarget.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        
        const newHeart = { id: Math.random(), x, y };
        setHearts(prev => [...prev, newHeart]);
        setTimeout(() => {
          setHearts(prev => prev.filter(h => h.id !== newHeart.id));
        }, 1000);
      }
    }

    lastMousePos.current = { x: clientX, y: clientY };
  };

  const handleLeave = () => {
    setIsPressed(false);
    setIsGrabbing(false);
    if (pressTimer.current) clearTimeout(pressTimer.current);
    lastMousePos.current = null;
    strokeDistance.current = 0;
    startDragPos.current = null;
  };

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
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleLeave}
      onMouseMove={handleMove}
      onTouchMove={handleMove}
      onClick={onClick}
      onDragStart={(e) => e.preventDefault()}
      className={`
        w-64 h-64 md:w-80 md:h-80 relative select-none transition-transform duration-75 
        ${isGrabbing ? 'cursor-grab active:cursor-grab' : 'cursor-pointer'}
        ${isPressed ? 'scale-95' : 'scale-100'}
      `}
    >
      {/* Ripple Effects */}
      {ripples.map(r => (
        <div 
          key={r.id}
          className="absolute rounded-full border-2 border-orange-300 pointer-events-none animate-ripple z-30"
          style={{ 
            left: r.x, 
            top: r.y,
            width: '40px',
            height: '40px',
            marginTop: '-20px',
            marginLeft: '-20px'
          }}
        />
      ))}

      {/* Visual Heart Particles */}
      {hearts.map(h => (
        <div 
          key={h.id}
          className="absolute text-pink-400 text-xl pointer-events-none animate-float-heart z-20"
          style={{ left: h.x, top: h.y }}
        >
          ❤️
        </div>
      ))}

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
          <g>
            {/* Left Ear */}
            <path 
              d="M 42 80 Q 28 55 38 28 Q 65 38 85 48" 
              fill="#fff1cc" stroke="#d4a373" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" 
            />
            {/* Left Ear Inner */}
            <path d="M 48 72 Q 42 55 46 38 Q 65 50 75 58" fill="#ffab91" opacity="0.6" />
            
            {/* Right Ear */}
            <path 
              d="M 158 80 Q 172 55 162 28 Q 135 38 115 48" 
              fill="#fff1cc" stroke="#d4a373" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" 
            />
            {/* Right Ear Inner */}
            <path d="M 152 72 Q 158 55 154 38 Q 135 50 125 58" fill="#ffab91" opacity="0.6" />
          </g>

          {/* Body Base (Head) */}
          <circle cx="100" cy="110" r="70" fill="#fff1cc" stroke="#d4a373" strokeWidth="2" />
          
          {/* Eyes */}
          {isBlinking ? (
            <>
              <path d="M69 100 L81 100" stroke="#5d4037" strokeWidth="3" strokeLinecap="round" />
              <path d="M119 100 L131 100" stroke="#5d4037" strokeWidth="3" strokeLinecap="round" />
            </>
          ) : isFever ? (
            <>
              <g filter="drop-shadow(0 0 2px rgba(255,152,0,0.5))">
                <text x="75" y="100" fontSize="28" textAnchor="middle" dominantBaseline="central" fill="#ff9800" stroke="#fff" strokeWidth="1.5" style={{ pointerEvents: 'none' }}>✨</text>
                <text x="125" y="100" fontSize="28" textAnchor="middle" dominantBaseline="central" fill="#ff9800" stroke="#fff" strokeWidth="1.5" style={{ pointerEvents: 'none' }}>✨</text>
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
