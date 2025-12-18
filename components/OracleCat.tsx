import React, { useState } from 'react';
import { OracleMode } from '../types';
import { ORACLE_COSTS } from '../constants';
import { getOracleWisdom } from '../services/geminiService';
import { Loader2, Leaf, Scroll, Sparkles } from 'lucide-react';

interface OracleCatProps {
  purrs: number;
  onSpend: (amount: number) => void;
}

export const OracleCat: React.FC<OracleCatProps> = ({ purrs, onSpend }) => {
  const [response, setResponse] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleAsk = async (mode: OracleMode) => {
    const cost = ORACLE_COSTS[mode];
    if (purrs < cost) return;

    onSpend(cost);
    setLoading(true);
    setResponse('');
    
    try {
      const result = await getOracleWisdom(mode);
      setResponse(result);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f1f8e9] rounded-2xl p-6 border border-[#c5e1a5] shadow-sm h-full flex flex-col">
      <div className="flex items-center gap-3 mb-4 border-b border-[#dcedc8] pb-4">
        <div className="bg-[#dcedc8] p-2 rounded-full">
          <Leaf className="w-6 h-6 text-[#558b2f]" />
        </div>
        <h2 className="text-xl font-bold text-[#33691e]">Forest Spirit Cat</h2>
      </div>

      <div className="bg-white/80 rounded-xl p-6 min-h-[120px] flex items-center justify-center border border-[#e2e8f0] mb-6 relative overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center gap-2 text-[#7cb342]">
            <Loader2 className="animate-spin w-8 h-8" />
            <span className="text-sm tracking-wide">Listening to the wind...</span>
          </div>
        ) : response ? (
          <div className="text-center">
            <span className="block text-2xl mb-2 opacity-20">❝</span>
            <p className="font-medium text-[#4a4a4a] italic leading-relaxed">{response}</p>
            <span className="block text-2xl mt-2 opacity-20">❞</span>
          </div>
        ) : (
          <p className="text-center text-gray-400 text-sm">
            Offer clover to receive guidance from the forest...
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 mt-auto">
        <button
          onClick={() => handleAsk(OracleMode.WISDOM)}
          disabled={loading || purrs < ORACLE_COSTS.WISDOM}
          className="flex items-center justify-between px-4 py-3 bg-white border border-[#dcedc8] rounded-xl hover:bg-[#f1f8e9] disabled:opacity-50 disabled:cursor-not-allowed transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="bg-[#f1f8e9] p-1.5 rounded-md">
                <Leaf className="w-4 h-4 text-[#7cb342]" />
            </div>
            <span className="text-sm font-bold text-[#5d5555] group-hover:text-[#33691e]">Nature's Wisdom</span>
          </div>
          <span className="text-xs font-bold text-[#7cb342]">-{ORACLE_COSTS.WISDOM} 🍀</span>
        </button>

        <button
          onClick={() => handleAsk(OracleMode.NAME)}
          disabled={loading || purrs < ORACLE_COSTS.NAME}
          className="flex items-center justify-between px-4 py-3 bg-white border border-[#dcedc8] rounded-xl hover:bg-[#f1f8e9] disabled:opacity-50 disabled:cursor-not-allowed transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="bg-[#fff3e0] p-1.5 rounded-md">
                <span className="text-sm">🏷️</span>
            </div>
            <span className="text-sm font-bold text-[#5d5555] group-hover:text-[#33691e]">Name Companion</span>
          </div>
          <span className="text-xs font-bold text-[#7cb342]">-{ORACLE_COSTS.NAME} 🍀</span>
        </button>
        
        <button
          onClick={() => handleAsk(OracleMode.STORY)}
          disabled={loading || purrs < ORACLE_COSTS.STORY}
          className="flex items-center justify-between px-4 py-3 bg-white border border-[#dcedc8] rounded-xl hover:bg-[#f1f8e9] disabled:opacity-50 disabled:cursor-not-allowed transition-all group"
        >
          <div className="flex items-center gap-3">
             <div className="bg-[#e0f2f1] p-1.5 rounded-md">
                <Scroll className="w-4 h-4 text-[#26a69a]" />
             </div>
            <span className="text-sm font-bold text-[#5d5555] group-hover:text-[#33691e]">Travel Log</span>
          </div>
          <span className="text-xs font-bold text-[#7cb342]">-{ORACLE_COSTS.STORY} 🍀</span>
        </button>
      </div>
    </div>
  );
};