import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CatAvatar } from './components/CatAvatar';
import { UpgradeList } from './components/UpgradeList';
import { OracleCat } from './components/OracleCat';
import { StatsPanel } from './components/StatsPanel';
import { INITIAL_UPGRADES } from './constants';
import { GameState, Upgrade, FloatingText } from './types';
import { Cat, Leaf, BarChart3 } from 'lucide-react';

const App: React.FC = () => {
  // Game State
  const [purrs, setPurrs] = useState<number>(0);
  const [gameState, setGameState] = useState<GameState>({
    purrs: 0,
    totalPurrs: 0,
    clickCount: 0,
    startTime: Date.now()
  });
  
  const [upgrades, setUpgrades] = useState<Upgrade[]>(INITIAL_UPGRADES);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [activeTab, setActiveTab] = useState<'shop' | 'oracle' | 'stats'>('shop');
  
  // Stats history for chart
  const [history, setHistory] = useState<{ time: number; purrs: number }[]>([]);

  // Refs for loop
  const requestRef = useRef<any>(null);
  const lastTimeRef = useRef<number>(0);
  
  // Calculate passive income
  const calculatePPS = useCallback(() => {
    return upgrades.reduce((acc, upgrade) => acc + (upgrade.cps * upgrade.count), 0);
  }, [upgrades]);

  const pps = calculatePPS();

  // Game Loop
  const animate = (time: number) => {
    if (lastTimeRef.current !== 0) {
      const deltaTime = (time - lastTimeRef.current) / 1000;
      
      if (deltaTime > 0) {
        const production = pps * deltaTime;
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
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pps]); 

  // Update chart history
  useEffect(() => {
    const interval = setInterval(() => {
      setHistory(prev => {
        const newHistory = [...prev, { time: Date.now(), purrs: purrs }];
        return newHistory.slice(-30); 
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [purrs]);

  // Click Handler
  const handleCatClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    // Calculate click power (1 + 10% of PPS)
    const clickPower = 1 + (pps * 0.1);
    
    setPurrs(prev => prev + clickPower);
    setGameState(prev => ({
      ...prev,
      clickCount: prev.clickCount + 1,
      totalPurrs: prev.totalPurrs + clickPower
    }));

    // Add floating text
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left + (Math.random() * 40 - 20); 
    const y = e.clientY - rect.top;
    
    const newText: FloatingText = {
      id: Date.now() + Math.random(),
      x: x,
      y: y,
      text: `+${clickPower.toFixed(1)}`
    };
    
    setFloatingTexts(prev => [...prev, newText]);
    
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(ft => ft.id !== newText.id));
    }, 1000);
  };

  // Buy Handler
  const handleBuyUpgrade = (id: string) => {
    setUpgrades(prev => prev.map(u => {
      if (u.id === id && purrs >= u.currentCost) {
        setPurrs(curr => curr - u.currentCost);
        return {
          ...u,
          count: u.count + 1,
          currentCost: Math.floor(u.baseCost * Math.pow(1.15, u.count + 1))
        };
      }
      return u;
    }));
  };

  const handleSpendPurrs = (amount: number) => {
    if (purrs >= amount) {
      setPurrs(prev => prev - amount);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row max-w-7xl mx-auto overflow-hidden bg-[#f9f8f2]">
      
      {/* Left Section: The Game */}
      <div className="flex-1 flex flex-col items-center justify-center relative p-6 h-[50vh] md:h-screen z-10">
        
        {/* Floating Header */}
        <div className="absolute top-4 w-full px-6 flex justify-between items-center z-20">
          <div className="bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-sm border border-[#89c965]/40 flex flex-col items-center min-w-[140px]">
            <span className="text-3xl font-bold text-[#558b2f] font-mono">
              {Math.floor(purrs).toLocaleString()}
            </span>
            <span className="text-xs uppercase tracking-widest font-bold text-[#8d6e63]">Clover</span>
          </div>
          <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-[#a1887f]/30">
             <span className="text-sm font-bold text-[#795548]">
               {pps.toFixed(1)} <span className="text-xs opacity-70">/ sec</span>
             </span>
          </div>
        </div>

        {/* The Giant Cat */}
        <div className="relative mt-8 md:mt-0">
          <CatAvatar onClick={handleCatClick} upgrades={upgrades} />
          
          {/* Render Floating Texts */}
          {floatingTexts.map(ft => (
            <div
              key={ft.id}
              className="floating-text absolute text-2xl font-bold text-[#89c965] pointer-events-none select-none text-shadow-sm"
              style={{ left: ft.x, top: ft.y }}
            >
              {ft.text}
            </div>
          ))}
        </div>
      </div>

      {/* Right Section: UI Panels */}
      <div className="flex-1 bg-[#ffffff] md:bg-transparent shadow-[0_-4px_20px_rgba(0,0,0,0.05)] md:shadow-none h-[50vh] md:h-screen flex flex-col z-20 rounded-t-[30px] md:rounded-none border-t border-[#e2e8f0] md:border-t-0">
        
        {/* Tab Navigation */}
        <div className="flex bg-[#f1f5f9]/80 backdrop-blur-md p-1.5 mx-4 mt-6 rounded-2xl gap-2 md:mx-0 md:mt-6 md:mr-6 border border-[#e2e8f0]">
          <button 
            onClick={() => setActiveTab('shop')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
              activeTab === 'shop' 
              ? 'bg-white text-[#558b2f] shadow-sm border border-[#e2e8f0]' 
              : 'text-[#94a3b8] hover:bg-white/50 hover:text-[#64748b]'
            }`}
          >
            <Cat className="w-4 h-4" /> Prep
          </button>
          <button 
            onClick={() => setActiveTab('oracle')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
              activeTab === 'oracle' 
              ? 'bg-white text-[#2e7d32] shadow-sm border border-[#e2e8f0]' 
              : 'text-[#94a3b8] hover:bg-white/50 hover:text-[#64748b]'
            }`}
          >
            <Leaf className="w-4 h-4" /> Spirit
          </button>
          <button 
            onClick={() => setActiveTab('stats')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
              activeTab === 'stats' 
              ? 'bg-white text-[#e65100] shadow-sm border border-[#e2e8f0]' 
              : 'text-[#94a3b8] hover:bg-white/50 hover:text-[#64748b]'
            }`}
          >
            <BarChart3 className="w-4 h-4" /> Log
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:pr-6 custom-scrollbar">
          {activeTab === 'shop' && (
            <UpgradeList upgrades={upgrades} purrs={purrs} onBuy={handleBuyUpgrade} />
          )}
          
          {activeTab === 'oracle' && (
            <OracleCat purrs={purrs} onSpend={handleSpendPurrs} />
          )}

          {activeTab === 'stats' && (
            <StatsPanel 
              totalPurrs={gameState.totalPurrs} 
              clickCount={gameState.clickCount} 
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