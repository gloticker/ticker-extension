import { useState } from 'react';
import { MarketSection } from './components/MarketSection';
import { Header } from './components/Header';
import { Settings } from './components/settings/Settings';
import { ThemeProvider } from './contexts/ThemeProvider';
import { useTheme, COLORS } from './constants/theme';
import { AnalysisModal } from './components/analysis/AnalysisModal';

export const App = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);

  return (
    <ThemeProvider>
      <AppContent
        showSettings={showSettings}
        setShowSettings={setShowSettings}
        isAnalysisOpen={isAnalysisOpen}
        setIsAnalysisOpen={setIsAnalysisOpen}
      />
    </ThemeProvider>
  );
}

interface AppContentProps {
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
  isAnalysisOpen: boolean;
  setIsAnalysisOpen: (open: boolean) => void;
}

function AppContent({ showSettings, setShowSettings, setIsAnalysisOpen, isAnalysisOpen }: AppContentProps) {
  const { theme } = useTheme();

  return (
    <div
      className="w-[300px] h-[600px] overflow-hidden relative"
      style={{
        backgroundColor: COLORS[theme].background,
        transition: 'all 0.3s ease'
      }}
    >
      <div className="relative w-full h-full">
        <div className={`absolute w-full h-full transition-transform duration-300 ease-in-out ${showSettings ? 'translate-x-[-100%]' : 'translate-x-0'}`}>
          <div className="h-full flex flex-col">
            <div className="flex items-center">
              <Header
                isSettings={showSettings}
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

        <div className={`absolute w-full h-full transition-transform duration-300 ease-in-out ${showSettings ? 'translate-x-0' : 'translate-x-[100%]'}`}>
          <Settings onClose={() => setShowSettings(false)} />
        </div>
      </div>
    </div>
  );
}

export default App;
