import React, { useState } from 'react';
import { Upgrade } from '../types';

interface UpgradeListProps {
  upgrades: Upgrade[];
  purrs: number;
  onBuy: (upgradeId: string) => void;
}

export const UpgradeList: React.FC<UpgradeListProps> = ({ upgrades, purrs, onBuy }) => {
  // Track which item was just bought to trigger animation
  const [justBoughtId, setJustBoughtId] = useState<string | null>(null);

  const handleBuy = (id: string) => {
    onBuy(id);
    setJustBoughtId(id);
    // Remove the animation class after it plays
    setTimeout(() => setJustBoughtId(null), 300);
  };

  return (
    <div className="flex flex-col gap-4 p-4 pb-20 md:pb-4">
      <h2 className="text-xl font-bold text-[#5d5555] mb-2 sticky top-0 bg-[#f9f8f2] z-10 py-3 border-b border-[#e2e8f0]">
        Travel Preparation
      </h2>
      {upgrades.map((upgrade) => {
        const canAfford = purrs >= upgrade.currentCost;
        const isPopping = justBoughtId === upgrade.id;

        return (
          <button
            key={upgrade.id}
            onClick={() => handleBuy(upgrade.id)}
            disabled={!canAfford}
            className={`
              relative flex items-center p-3 rounded-xl border-2 transition-all duration-200 text-left group
              ${isPopping ? 'animate-success-pop border-[#89c965] bg-[#f1f8e9]' : ''}
              ${canAfford 
                ? 'bg-white border-[#89c965]/30 hover:border-[#89c965] hover:shadow-sm cursor-pointer' 
                : 'bg-[#f1f5f9] border-gray-200 opacity-60 cursor-not-allowed'}
            `}
          >
            <div className={`text-3xl mr-4 p-3 rounded-full transition-colors ${canAfford ? 'bg-[#f1f8e9] group-hover:bg-[#dcedc8]' : 'bg-gray-100'}`}>
              {upgrade.icon}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-[#4a4a4a]">{upgrade.name}</h3>
                <span className={`text-xl font-bold transition-transform ${isPopping ? 'scale-125 text-[#558b2f]' : 'text-[#89c965]'}`}>
                  {upgrade.count}
                </span>
              </div>
              <p className="text-xs text-[#8d6e63] mb-1 opacity-80">{upgrade.description}</p>
              <div className="flex items-center gap-1">
                <span className={`text-sm font-bold ${canAfford ? 'text-[#689f38]' : 'text-red-400'}`}>
                  {upgrade.currentCost.toLocaleString()} Clover
                </span>
                <span className="text-xs text-gray-400 ml-1">+{upgrade.cps} CPS</span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};