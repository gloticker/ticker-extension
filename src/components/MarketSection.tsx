import { useState } from 'react';
import { MarketList } from './MarketList';
import { MarketType } from '../types/market';
import { ChevronDown, ChevronUp } from './Icons';  // 아이콘 컴포넌트 추가 필요

interface MarketSectionProps {
  title: string;
  type: MarketType;
}

export const MarketSection = ({ title, type }: MarketSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="border-b border-gray-800 last:border-0">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between py-2 hover:bg-slate-800/50 transition-colors"
      >
        <h2 className="text-lg font-medium">{title}</h2>
        <span className="text-gray-400">
          {isExpanded ? <ChevronUp /> : <ChevronDown />}
        </span>
      </button>
      
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="py-2">
          <MarketList type={type} />
        </div>
      </div>
    </div>
  );
}; 