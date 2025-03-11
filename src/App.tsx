import { useState } from 'react';
import { MarketSection } from './components/MarketSection';
import { Header } from './components/Header';
import { Settings } from './components/settings/Settings';
import { useTheme } from './hooks/useTheme';
import { COLORS } from './constants/theme';
import { AnalysisModal } from './components/analysis/AnalysisModal';

function App() {
  const [showSettings, setShowSettings] = useState(false);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const { theme } = useTheme();

  return (
    <div
      className="w-[300px] h-[600px] overflow-hidden relative"
      style={{
        backgroundColor: COLORS[theme].background,
        border: 'none',
        outline: 'none'
      }}
    >
      <div className="relative w-full h-full">
        <div
          className={`absolute w-full h-full transition-transform duration-300 ease-in-out ${showSettings ? 'translate-x-[-100%]' : 'translate-x-0'
            }`}
          style={{ backgroundColor: COLORS[theme].background }}
        >
          <div className="h-full flex flex-col">
            <div className="flex items-center">
              <Header
                isSettings={false}
                onSettingsClick={() => setShowSettings(true)}
                onAnalysisClick={() => setIsAnalysisOpen(true)}
              />
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              <div className="space-y-2">
                <MarketSection />
              </div>
            </div>

            <AnalysisModal
              isOpen={isAnalysisOpen}
              onClose={() => setIsAnalysisOpen(false)}
            />
          </div>
        </div>

        <div
          className={`absolute w-full h-full transition-transform duration-300 ease-in-out ${showSettings ? 'translate-x-0' : 'translate-x-[100%]'
            }`}
          style={{ backgroundColor: COLORS[theme].background }}
        >
          <Settings onClose={() => setShowSettings(false)} />
        </div>
      </div>
    </div>
  );
}

export default App;
