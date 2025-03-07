import { useState } from 'react';
import { MarketSection } from './components/MarketSection';
import { Header } from './components/Header';
import { Settings } from './components/settings/Settings';
import { ThemeProvider } from './contexts/ThemeProvider';
import { useTheme, COLORS } from './constants/theme';

function App() {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <ThemeProvider>
      <AppContent showSettings={showSettings} setShowSettings={setShowSettings} />
    </ThemeProvider>
  );
}

// ThemeProvider 내부에서 useTheme 사용
function AppContent({ showSettings, setShowSettings }: { showSettings: boolean; setShowSettings: (show: boolean) => void }) {
  const { theme } = useTheme();

  return (
    <div
      className="w-[300px] h-[600px] overflow-hidden"
      style={{
        backgroundColor: COLORS[theme].background,
        transition: 'all 0.3s ease'  // 모든 속성에 대해 transition 적용
      }}
    >
      <div className="relative w-full h-full">
        <div className={`absolute w-full h-full transition-transform duration-300 ease-in-out ${showSettings ? 'translate-x-[-100%]' : 'translate-x-0'}`}>
          <div className="h-full flex flex-col">
            <Header onSettingsClick={() => setShowSettings(true)} />
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              <div className="space-y-2">
                <MarketSection />
              </div>
            </div>
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
