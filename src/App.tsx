import { useState, useEffect } from 'react';
import { MarketSection } from './components/MarketSection';
import { Header } from './components/Header';
import { Settings } from './components/settings/Settings';
import { useTheme } from './hooks/useTheme';
import { COLORS } from './constants/theme';
import { AnalysisModal } from './components/analysis/AnalysisModal';

// 전역 스타일 적용
const style = document.createElement('style');
style.textContent = `
  html, body {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
  }
`;
document.head.appendChild(style);

function App() {
  const [showSettings, setShowSettings] = useState(false);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    document.body.style.backgroundColor = COLORS[theme].background;
  }, [theme]);

  return (
    <div
      style={{
        width: '50vh',
        height: '100vh',
        overflow: 'hidden',
        position: 'relative',
        border: 'none',
        outline: 'none',
        margin: '0 auto'
      }}
    >
      <div style={{
        position: 'relative',
        width: '100%',
        height: '100%'
      }}>
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            transition: 'transform 300ms ease-in-out',
            transform: showSettings ? 'translateX(-100%)' : 'translateX(0)'
          }}
        >
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Header
              isSettings={false}
              onSettingsClick={() => setShowSettings(true)}
              onAnalysisClick={() => setIsAnalysisOpen(true)}
            />
            <div style={{
              flex: 1,
              overflowY: 'auto'
            }} className="scrollbar-hide">
              <MarketSection />
            </div>

            <AnalysisModal
              isOpen={isAnalysisOpen}
              onClose={() => setIsAnalysisOpen(false)}
            />
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            transition: 'transform 300ms ease-in-out',
            transform: showSettings ? 'translateX(0)' : 'translateX(100%)'
          }}
        >
          <Settings onClose={() => setShowSettings(false)} />
        </div>
      </div>
    </div>
  );
}

export default App;
