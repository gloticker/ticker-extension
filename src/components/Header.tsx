import { useTheme, COLORS } from '../constants/theme';
import { useState, useEffect } from 'react';
import { format, toZonedTime } from 'date-fns-tz';
import { useI18n, TRANSLATIONS } from '../constants/i18n';

interface HeaderProps {
    isSettings?: boolean;
    onSettingsClick: () => void;
}

type MarketStatusType = 'pre' | 'regular' | 'after' | 'closed';

const getMarketStatus = (): MarketStatusType => {
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
    const { language } = useI18n();

    const getNYTime = () => {
        const nyDate = toZonedTime(new Date(), 'America/New_York');
        const time = format(nyDate, 'hh:mm:ss', { timeZone: 'America/New_York' });
        const period = format(nyDate, 'a', { timeZone: 'America/New_York' });
        return { time, period };
    };

    const [marketStatus, setMarketStatus] = useState<MarketStatusType>(getMarketStatus());
    const [showStatus, setShowStatus] = useState(() => {
        const saved = localStorage.getItem('showMarketStatus');
        return saved ? JSON.parse(saved) : false;
    });
    const [currentTime, setCurrentTime] = useState(getNYTime());

    const primaryColor = COLORS[theme].text.primary;
    const brightness = parseInt(primaryColor.slice(1), 16) / 0xFFFFFF;

    // showStatus 변경시 localStorage 저장
    useEffect(() => {
        localStorage.setItem('showMarketStatus', JSON.stringify(showStatus));
    }, [showStatus]);

    // 마켓 상태 업데이트
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

    // 시간 업데이트 - 1초가 아닌 0.5초로 변경
    useEffect(() => {
        if (!showStatus) return; // 마우스 오버 상태일 때만 업데이트

        const timer = setInterval(() => {
            setCurrentTime(getNYTime());
        }, 1000);

        return () => clearInterval(timer);
    }, [showStatus]);

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
                    <div className="flex items-center relative">
                        <button
                            className="w-[18px] h-[18px]"
                            onClick={() => setShowStatus((prev: boolean) => !prev)}
                        >
                            <img
                                src={getMarketIcon()}
                                alt="market status"
                                style={{ filter: `brightness(${brightness})` }}
                            />
                        </button>
                        <div className="absolute left-7 whitespace-nowrap transition-opacity duration-300 pointer-events-none h-[50px]"
                            style={{
                                color: COLORS[theme].text.primary,
                                opacity: showStatus ? 1 : 0,
                            }}
                        >
                            <div className="absolute -translate-y-1/2 top-1/2">
                                <span className="flex items-center text-xs">
                                    <span className="w-11 tabular-nums">{currentTime.time}</span>
                                    <span className="ml-3">{currentTime.period}</span>
                                </span>
                            </div>
                            <div className="absolute top-[55%]">
                                <span className="text-[10px]">{TRANSLATIONS[language].marketStatus[marketStatus]}</span>
                            </div>
                        </div>
                    </div>

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
