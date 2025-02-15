import { useState, useEffect } from 'react';
import { MarketList } from './MarketList';
import { MarketType } from '../types/market';
import { ChevronDown, ChevronUp } from './Icons';  // 아이콘 컴포넌트 추가 필요

interface MarketSectionProps {
  title: string;
  type: MarketType;
}

export const MarketSection = ({ title, type }: MarketSectionProps) => {
  const [isExpanded, setIsExpanded] = useState<boolean | null>(null);  // 초기값을 null로 설정
  const storageKey = `section_${type}_expanded`;

  // 초기 상태 로드
  useEffect(() => {
    const loadExpandedState = async () => {
      try {
        const result = await chrome.storage.local.get(storageKey);
        // 명시적으로 boolean 타입으로 변환
        setIsExpanded(result[storageKey] === undefined ? true : !!result[storageKey]);
      } catch (error) {
        console.error('Failed to load section state:', error);
        setIsExpanded(true);  // 에러 시 기본값
      }
    };

    loadExpandedState();
  }, [storageKey]);

  // 상태 변경 시 저장
  const toggleExpand = async () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    try {
      await chrome.storage.local.set({ [storageKey]: newState });
    } catch (error) {
      console.error('Failed to save section state:', error);
    }
  };

  // 초기 로딩 중에는 기본 펼침 상태로 표시
  if (isExpanded === null) {
    return null;  // 또는 로딩 상태 표시
  }

  return (
    <div className="border-b border-gray-800 last:border-0">
      <button
        onClick={toggleExpand}
        className="w-full flex items-center justify-between py-2 hover:bg-slate-800/50 transition-colors"
      >
        <h2 className="text-lg font-medium">{title}</h2>
        <span className="text-gray-400">
          {isExpanded ? <ChevronUp /> : <ChevronDown />}
        </span>
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
      >
        <div className="py-2">
          <MarketList type={type} />
        </div>
      </div>
    </div>
  );
}; 