
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { CatAvatar } from './components/CatAvatar';
import { UpgradeList } from './components/UpgradeList';
import { StatsPanel } from './components/StatsPanel';
import { INITIAL_UPGRADES } from './constants';
import { GameState, Upgrade, FloatingText } from './types';
import { audioService } from './services/audioService';
import { Cat, Leaf, BarChart3, Zap, Heart, Clock } from 'lucide-react';

const STROKE_CAP = 500;
const RESET_TIME_MS = 5 * 60 * 1000; // 5 minutes

const App: React.FC = () => {
  // Game State
  const [purrs, setPurrs] = useState<number>(0);
  const [gameState, setGameState] = useState<GameState>({
    purrs: 0,
    totalPurrs: 0,
    clickCount: 0,
    pettingPurrs: 0,
    startTime: Date.now(),
    combo: 0,
    multiplier: 1,
    isFeverMode: false
  });
  
  // Petting State
  const [pettingScore, setPettingScore] = useState<number>(0);
  const [nextResetTime, setNextResetTime] = useState<number>(Date.now() + RESET_TIME_MS);
  
  const [feverMultiplier, setFeverMultiplier] = useState<number>(1);
  const [upgrades, setUpgrades] = useState<Upgrade[]>(INITIAL_UPGRADES);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [activeTab, setActiveTab] = useState<'shop' | 'stats'>('shop');
  const [history, setHistory] = useState<{ time: number; purrs: number }[]>([]);

  // Refs
  const requestRef = useRef<any>(null);
  const lastTimeRef = useRef<number>(0);
  const comboTimeoutRef = useRef<any>(null);
  
  // Base Purrs Per Second
  const basePPS = useMemo(() => {
    return upgrades.reduce((acc, upgrade) => acc + (upgrade.cps * upgrade.count), 0);
  }, [upgrades]);

  // Active Purrs Per Second
  const activePPS = useMemo(() => {
    const mult = gameState.isFeverMode ? feverMultiplier : 1;
    return basePPS * mult;
  }, [basePPS, gameState.isFeverMode, feverMultiplier]);

  // Petting Reset Timer Logic
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      if (now >= nextResetTime) {
        setPettingScore(0);
        setNextResetTime(now + RESET_TIME_MS);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [nextResetTime]);

  // Game Loop
  const animate = (time: number) => {
    if (lastTimeRef.current !== 0) {
      const deltaTime = (time - lastTimeRef.current) / 1000;
      if (deltaTime > 0) {
        const production = activePPS * deltaTime;
        if (production > 0) {
          setPurrs(prev => prev + production);
          setGameState(prev => ({
            ...prev,
            totalPurrs: prev.totalPurrs + production
          }));
        }
      }
    }
    lastTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [activePPS]);

  // Fever Logic
  useEffect(() => {
    if (gameState.combo >= 20 && !gameState.isFeverMode) {
      setGameState(prev => ({ ...prev, isFeverMode: true }));
      setFeverMultiplier(2.0);
    }
    if (gameState.combo === 0 && gameState.isFeverMode) {
      setGameState(prev => ({ ...prev, isFeverMode: false }));
      setFeverMultiplier(1.0);
    }
  }, [gameState.combo, gameState.isFeverMode]);

  // History Recording
  useEffect(() => {
    const interval = setInterval(() => {
      setHistory(prev => {
        const newHistory = [...prev, { time: Date.now(), purrs: purrs }];
        return newHistory.slice(-30); 
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [purrs]);

  // Handle Stroking/Petting
  const handleCatStroke = useCallback((e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (pettingScore >= STROKE_CAP) return;

    audioService.playPurrSound();
    
    // Stroking gives 0.5 points per trigger (throttled in CatAvatar) * fever mult
    const strokeValue = 0.5 * (gameState.isFeverMode ? feverMultiplier : 1);
    
    setPettingScore(prev => Math.min(STROKE_CAP, prev + strokeValue));
    setPurrs(prev => prev + strokeValue);
    setGameState(prev => ({ 
      ...prev, 
      totalPurrs: prev.totalPurrs + strokeValue,
      pettingPurrs: (prev.pettingPurrs || 0) + strokeValue
    }));

    // Small chance for floating text on stroke
    if (Math.random() > 0.7) {
      let clientX, clientY;
      if ('touches' in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = (e as React.MouseEvent).clientX;
        clientY = (e as React.MouseEvent).clientY;
      }
      
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const x = clientX - rect.left + (Math.random() * 20 - 10);
      const y = clientY - rect.top - 20;

      const newText: FloatingText = {
        id: Date.now() + Math.random(),
        x: x,
        y: y,
        text: `+${strokeValue.toFixed(1)}`,
        isFever: gameState.isFeverMode
      };
      
      setFloatingTexts(prev => [...prev, newText]);
      setTimeout(() => {
        setFloatingTexts(prev => prev.filter(ft => ft.id !== newText.id));
      }, 1000);
    }
  }, [pettingScore, gameState.isFeverMode, feverMultiplier]);

  // Handle Click
  const handleCatClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    audioService.playClickSound();

    if (gameState.isFeverMode) {
      setFeverMultiplier(prev => Math.min(5.0, prev + 0.1));
    }

    const currentMult = gameState.isFeverMode ? feverMultiplier : 1;
    const baseClickPower = 1 + (basePPS * 0.1);
    const clickPower = baseClickPower * currentMult;
    
    setPurrs(prev => prev + clickPower);
    setGameState(prev => {
      if (comboTimeoutRef.current) clearTimeout(comboTimeoutRef.current);
      comboTimeoutRef.current = setTimeout(() => {
        setGameState(s => ({ ...s, combo: 0 }));
      }, 2000);

      return {
        ...prev,
        clickCount: prev.clickCount + 1,
        totalPurrs: prev.totalPurrs + clickPower,
        combo: prev.isFeverMode ? Math.max(prev.combo, 20) : prev.combo + 1
      };
    });

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left + (Math.random() * 40 - 20); 
    const y = e.clientY - rect.top;
    
    const newText: FloatingText = {
      id: Date.now() + Math.random(),
      x: x,
      y: y,
      text: `+${clickPower.toFixed(1)}`,
      isFever: gameState.isFeverMode
    };
    
    setFloatingTexts(prev => [...prev, newText]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(ft => ft.id !== newText.id));
    }, 1000);
  };

  const handleBuyUpgrade = (id: string) => {
    setUpgrades(prev => {
      const targetUpgrade = prev.find(u => u.id === id);
      if (targetUpgrade && purrs >= targetUpgrade.currentCost) {
        audioService.playBuySound();
        setPurrs(curr => curr - targetUpgrade.currentCost);
        
        return prev.map(u => {
          if (u.id === id) {
            return {
              ...u,
              count: u.count + 1,
              currentCost: Math.floor(u.baseCost * Math.pow(1.15, u.count + 1))
            };
          }
          return u;
        });
      }
      return prev;
    });
  };

  // Helper to format time remaining
  const getTimeRemaining = () => {
    const diff = Math.max(0, nextResetTime - Date.now());
    const mins = Math.floor(diff / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`min-h-screen flex flex-col md:flex-row max-w-7xl mx-auto overflow-hidden transition-colors duration-500 ${gameState.isFeverMode ? 'bg-orange-50' : 'bg-[#f9f8f2]'}`}>
      
      {/* Left Section: The Game */}
      <div className="flex-1 flex flex-col items-center justify-center relative p-6 h-[55vh] md:h-screen z-10">
        
        {/* Floating Header */}
        <div className="absolute top-4 w-full px-6 flex justify-between items-start z-20">
          <div className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-lg border border-[#89c965]/40 flex flex-col items-center min-w-[150px]">
            <span className={`text-4xl font-bold font-mono transition-colors ${gameState.isFeverMode ? 'text-red-500' : 'text-[#558b2f]'}`}>
              {Math.floor(purrs).toLocaleString()}
            </span>
            <span className="text-xs uppercase tracking-widest font-black text-[#8d6e63] flex items-center gap-1">
              <Leaf className="w-3 h-3" /> Clover
            </span>
          </div>

          <div className="flex flex-col items-end gap-2">
            
            {/* Petting Love Tank Indicator - Moved here */}
            <div className="flex items-center gap-3 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-md border border-pink-100">
              <div className="relative">
                <Heart className={`w-5 h-5 ${pettingScore >= STROKE_CAP ? 'text-gray-300' : 'text-pink-500 fill-pink-500'}`} />
              </div>
              <div className="flex flex-col">
                <div className="w-24 md:w-32 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${pettingScore >= STROKE_CAP ? 'bg-gray-400' : 'bg-pink-400'}`}
                    style={{ width: `${((STROKE_CAP - pettingScore) / STROKE_CAP) * 100}%` }}
                  />
                </div>
                {pettingScore >= STROKE_CAP && (
                   <span className="text-[10px] text-gray-500 flex items-center gap-1 mt-1 justify-end font-bold">
                     <Clock className="w-3 h-3" /> {getTimeRemaining()}
                   </span>
                 )}
              </div>
            </div>

            <div className={`bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-md border flex items-center gap-2 transition-colors ${gameState.isFeverMode ? 'border-orange-400' : 'border-[#a1887f]/30'}`}>
               <span className={`text-sm font-bold ${gameState.isFeverMode ? 'text-orange-600' : 'text-[#795548]'}`}>
                 {activePPS.toFixed(1)} <span className="text-xs opacity-70">/ sec</span>
               </span>
               {gameState.isFeverMode && (
                 <div className="flex items-center gap-1">
                   <Zap className="w-4 h-4 text-orange-500 fill-orange-500 animate-pulse" />
                   <span className="text-xs font-black text-orange-600">x{feverMultiplier.toFixed(1)}</span>
                 </div>
               )}
            </div>
            
            {/* Combo Bar */}
            {!gameState.isFeverMode && gameState.combo > 0 && (
              <div className="w-32 h-3 bg-gray-200 rounded-full overflow-hidden border border-white shadow-inner">
                <div 
                  className="h-full bg-orange-400 transition-all duration-200"
                  style={{ width: `${(gameState.combo / 20) * 100}%` }}
                />
              </div>
            )}
          </div>
        </div>

        {/* The Giant Cat */}
        <div className="relative mt-12 md:mt-0 flex flex-col items-center">
          <div className="relative">
            <CatAvatar 
              onClick={handleCatClick} 
              onStroke={handleCatStroke}
              upgrades={upgrades} 
              isFever={gameState.isFeverMode}
              pps={activePPS}
              feverMultiplier={feverMultiplier}
              canPet={pettingScore < STROKE_CAP}
            />
            
            {floatingTexts.map(ft => (
              <div
                key={ft.id}
                className={`floating-text absolute text-2xl font-black pointer-events-none select-none drop-shadow-md ${ft.isFever ? 'text-red-500 text-3xl' : 'text-[#89c965]'}`}
                style={{ left: ft.x, top: ft.y }}
              >
                {ft.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Section: UI Panels */}
      <div className="flex-1 bg-white md:bg-white/50 backdrop-blur-sm shadow-2xl h-[45vh] md:h-screen flex flex-col z-20 rounded-t-[40px] md:rounded-none border-t border-[#e2e8f0] md:border-l">
        
        {/* Tab Navigation */}
        <div className="flex bg-[#f1f5f9]/80 backdrop-blur-md p-1.5 mx-6 mt-6 rounded-2xl gap-3 border border-[#e2e8f0]">
          <button 
            onClick={() => setActiveTab('shop')}
            className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
              activeTab === 'shop' 
              ? 'bg-white text-[#558b2f] shadow-md scale-105' 
              : 'text-[#94a3b8] hover:bg-white/50'
            }`}
          >
            <Cat className="w-4 h-4" /> Shop
          </button>
          <button 
            onClick={() => setActiveTab('stats')}
            className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
              activeTab === 'stats' 
              ? 'bg-white text-[#e65100] shadow-md scale-105' 
              : 'text-[#94a3b8] hover:bg-white/50'
            }`}
          >
            <BarChart3 className="w-4 h-4" /> Stats
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
          {activeTab === 'shop' && (
            <UpgradeList upgrades={upgrades} purrs={purrs} onBuy={handleBuyUpgrade} />
          )}
          
          {activeTab === 'stats' && (
            <StatsPanel 
              totalPurrs={gameState.totalPurrs} 
              clickCount={gameState.clickCount} 
              pettingPurrs={gameState.pettingPurrs || 0}
              startTime={gameState.startTime}
              history={history}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
