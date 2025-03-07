import { useTheme, COLORS } from '../constants/theme';
import { useState, useEffect } from 'react';
import { format, toZonedTime } from 'date-fns-tz';

interface HeaderProps {
    isSettings?: boolean;
    onSettingsClick: () => void;
}

const getMarketStatus = () => {
    const nyDate = toZonedTime(new Date(), 'America/New_York');
    const nyTime = format(nyDate, 'HH:mm', { timeZone: 'America/New_York' });
    const [hours, minutes] = nyTime.split(':').map(Number);
    const timeInMinutes = hours * 60 + minutes;

    // Closed: 20:00 PM - 04:00 AM (1200 - 240)
    if (timeInMinutes >= 1200 || timeInMinutes < 240) {
        return 'closed';
    }
    // Pre-market: 4:00 AM - 9:30 AM (240 - 570)
    else if (timeInMinutes >= 240 && timeInMinutes < 570) {
        return 'pre';
    }
    // Regular: 9:30 AM - 4:00 PM (570 - 960)
    else if (timeInMinutes >= 570 && timeInMinutes < 960) {
        return 'regular';
    }
    // After: 4:00 PM - 8:00 PM (960 - 1200)
    else {
        return 'after';
    }
};

const getNextUpdateDelay = () => {
    const nyDate = toZonedTime(new Date(), 'America/New_York');
    const nyTime = format(nyDate, 'HH:mm:ss', { timeZone: 'America/New_York' });
    const [hours, minutes, seconds] = nyTime.split(':').map(Number);
    const timeInMinutes = hours * 60 + minutes;

    let nextCheckpoint;
    if (timeInMinutes < 240) nextCheckpoint = 240; // 4:00 AM
    else if (timeInMinutes < 570) nextCheckpoint = 570; // 9:30 AM
    else if (timeInMinutes < 960) nextCheckpoint = 960; // 4:00 PM
    else if (timeInMinutes < 1200) nextCheckpoint = 1200; // 8:00 PM
    else nextCheckpoint = 1440 + 240; // 다음날 4:00 AM

    const minutesUntilNext = nextCheckpoint - timeInMinutes;
    const secondsUntilNext = minutesUntilNext * 60 - seconds;

    return secondsUntilNext * 1000; // 밀리초 단위로 반환
};

export const Header = ({ isSettings, onSettingsClick }: HeaderProps) => {
    const { theme } = useTheme();
    const [marketStatus, setMarketStatus] = useState(getMarketStatus());
    const primaryColor = COLORS[theme].text.primary;
    const brightness = parseInt(primaryColor.slice(1), 16) / 0xFFFFFF;

    useEffect(() => {
        const scheduleNextUpdate = () => {
            const delay = getNextUpdateDelay();
            const timer = setTimeout(() => {
                setMarketStatus(getMarketStatus());
                scheduleNextUpdate();
            }, delay);
            return timer;
        };

        const timer = scheduleNextUpdate();
        return () => clearTimeout(timer);
    }, []);

    const getMarketIcon = () => {
        switch (marketStatus) {
            case 'pre':
                return '/images/icon/pre-market.svg';
            case 'regular':
                return '/images/icon/regular-market.svg';
            case 'after':
                return '/images/icon/after-market.svg';
            default:
                return '/images/icon/market-closed.svg';
        }
    };

    return (
        <div
            className="h-[50px] px-4 flex items-center justify-between"
            style={{ backgroundColor: COLORS[theme].background }}
        >
            {!isSettings && (
                <>
                    <button className="w-[18px] h-[18px]">
                        <img
                            src={getMarketIcon()}
                            alt="market status"
                            style={{
                                filter: `brightness(${brightness})`
                            }}
                        />
                    </button>

                    <button className="w-[18px] h-[18px]">
                        <img
                            src="/images/icon/ai.svg"
                            alt="ai"
                            style={{
                                filter: `brightness(${brightness})`
                            }}
                        />
                    </button>
                </>
            )}

            <button
                className={isSettings ? "w-[20px] h-[10px] ml-auto" : "w-[18px] h-[18px]"}
                onClick={onSettingsClick}
            >
                <img
                    src={isSettings ? "/images/icon/back.svg" : "/images/icon/setting.svg"}
                    alt={isSettings ? "back" : "settings"}
                    style={{
                        filter: `brightness(${brightness})`
                    }}
                />
            </button>
        </div>
    );
};
