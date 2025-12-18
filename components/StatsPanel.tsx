import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface StatsPanelProps {
  totalPurrs: number;
  clickCount: number;
  startTime: number;
  history: { time: number; purrs: number }[];
}

export const StatsPanel: React.FC<StatsPanelProps> = ({ totalPurrs, clickCount, startTime, history }) => {
  const elapsed = Math.max(1, Math.floor((Date.now() - startTime) / 1000));
  
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#e2e8f0]">
      <h3 className="text-lg font-bold text-[#5d5555] mb-4 border-b border-gray-100 pb-2">Travel Statistics</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-[#f1f8e9] p-4 rounded-xl border border-[#dcedc8]">
          <p className="text-xs text-[#558b2f] uppercase tracking-wider font-semibold">Total Clover</p>
          <p className="text-xl font-bold text-[#33691e] mt-1">{totalPurrs.toLocaleString()}</p>
        </div>
        <div className="bg-[#fff3e0] p-4 rounded-xl border border-[#ffe0b2]">
          <p className="text-xs text-[#ef6c00] uppercase tracking-wider font-semibold">Taps</p>
          <p className="text-xl font-bold text-[#e65100] mt-1">{clickCount.toLocaleString()}</p>
        </div>
        <div className="bg-[#e0f2f1] p-4 rounded-xl border border-[#b2dfdb]">
          <p className="text-xs text-[#00695c] uppercase tracking-wider font-semibold">Journey Time</p>
          <p className="text-xl font-bold text-[#004d40] mt-1">{elapsed}s</p>
        </div>
      </div>

      <div className="h-48 w-full mt-6 bg-[#fafafa] rounded-xl p-2 border border-gray-100">
        <p className="text-xs text-gray-400 mb-2 pl-2">Collection Rate</p>
        <ResponsiveContainer width="100%" height="90%">
          <AreaChart data={history}>
            <defs>
              <linearGradient id="colorPurrs" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#89c965" stopOpacity={0.6}/>
                <stop offset="95%" stopColor="#89c965" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="time" hide />
            <YAxis hide />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: '#fff' }}
              labelStyle={{ display: 'none' }}
              itemStyle={{ color: '#558b2f' }}
            />
            <Area 
              type="monotone" 
              dataKey="purrs" 
              stroke="#89c965" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorPurrs)" 
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};