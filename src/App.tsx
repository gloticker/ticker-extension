import { useState } from 'react';
import { MarketSection } from './components/MarketSection';
import { Header } from './components/Header';
import { COLORS } from './constants/theme';
import { useTheme } from './contexts/ThemeContext';

function App() {
  const { theme } = useTheme();
  const [showSettings] = useState(false);

  return (
    <div
      className="w-[300px] h-[600px] overflow-hidden"
      style={{ backgroundColor: COLORS[theme].background }}
    >
      <div className="relative w-full h-full">
        <div
          className={`absolute w-full h-full transition-transform duration-300 ease-in-out ${showSettings ? 'translate-x-[-100%]' : 'translate-x-0'
            }`}
        >
          <div className="h-full flex flex-col">
            <Header />
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              <div className="space-y-2">
                <MarketSection />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
