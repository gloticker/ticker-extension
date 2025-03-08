import { useTheme, COLORS } from '../constants/theme';
import { useState, useEffect } from 'react';
import { format, toZonedTime } from 'date-fns-tz';
import { useI18n, TRANSLATIONS } from '../constants/i18n';
import { isMarketHoliday } from '../constants/marketHolidays';
import { MARKET_TIMES } from '../constants/marketTimes';

interface HeaderProps {
    isSettings?: boolean;
    onSettingsClick: () => void;
}

type MarketStatusType = 'pre' | 'regular' | 'after' | 'closed';

const isWeekend = (date: Date): boolean => {
    const day = date.getDay();
    return day === 0 || day === 6;
};

const getMarketStatus = (date: Date, timeInMinutes: number): MarketStatusType => {
    if (isWeekend(date) || isMarketHoliday(date)) {
        return 'closed';
    }

    if (timeInMinutes >= MARKET_TIMES.CLOSED_START || timeInMinutes < MARKET_TIMES.PRE_START) return 'closed';
    if (timeInMinutes < MARKET_TIMES.REGULAR_START) return 'pre';
    if (timeInMinutes < MARKET_TIMES.AFTER_START) return 'regular';
    return 'after';
};

const useNYDateTime = () => {
    const getNYDateTime = () => {
        const nyDate = toZonedTime(new Date(), 'America/New_York');
        return {
            date: nyDate,
            time: format(nyDate, 'h:mm:ss', { timeZone: 'America/New_York' }),
            period: format(nyDate, 'a', { timeZone: 'America/New_York' }),
            minutes: nyDate.getHours() * 60 + nyDate.getMinutes(),
            seconds: nyDate.getSeconds()
        };
    };

    const [nyDateTime, setNYDateTime] = useState(getNYDateTime());

    // 1초마다 시간 업데이트
    useEffect(() => {
        const timer = setInterval(() => {
            setNYDateTime(getNYDateTime());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    return nyDateTime;
};

export const Header = ({ isSettings, onSettingsClick }: HeaderProps) => {
    const { theme } = useTheme();
    const { language } = useI18n();
    const nyDateTime = useNYDateTime();

    const [marketStatus, setMarketStatus] = useState<MarketStatusType>(() =>
        getMarketStatus(nyDateTime.date, nyDateTime.minutes)
    );
    const [showStatus, setShowStatus] = useState(() => {
        const saved = localStorage.getItem('showMarketStatus');
        return saved ? JSON.parse(saved) : false;
    });

    // 마켓 상태 업데이트
    useEffect(() => {
        const newStatus = getMarketStatus(nyDateTime.date, nyDateTime.minutes);
        if (newStatus !== marketStatus) {
            setMarketStatus(newStatus);
        }
    }, [nyDateTime.minutes, nyDateTime.date, marketStatus]);

    const primaryColor = COLORS[theme].text.primary;
    const brightness = parseInt(primaryColor.slice(1), 16) / 0xFFFFFF;

    // showStatus 변경시 localStorage 저장
    useEffect(() => {
        localStorage.setItem('showMarketStatus', JSON.stringify(showStatus));
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
            className="h-[50px] w-full flex items-center justify-between"
            style={{ backgroundColor: COLORS[theme].background }}
        >
            <div className="w-full max-w-[288px] px-4 mx-auto flex items-center justify-between">
                {!isSettings && (
                    <>
                        <div className="flex items-center relative">
                            <button
                                className="w-[18px] h-[18px]"
                                onClick={() => {
                                    setShowStatus((prev: boolean) => !prev);
                                }}
                            >
                                <img
                                    src={getMarketIcon()}
                                    alt="market status"
                                    style={{ filter: `brightness(${brightness})` }}
                                />
                            </button>
                            <div className="absolute left-5 whitespace-nowrap transition-opacity duration-300 pointer-events-none h-[50px]"
                                style={{
                                    color: COLORS[theme].text.primary,
                                    opacity: showStatus ? 1 : 0,
                                }}
                            >
                                <div className="absolute -translate-y-1/2 top-1/2 flex flex-col items-end">
                                    <span className="flex items-center text-xs">
                                        <span className="inline-block w-[52px] tabular-nums text-right">{nyDateTime.time}</span>
                                        <span className="ml-1">{nyDateTime.period}</span>
                                    </span>
                                    <span className="text-[10px] mt-1">{TRANSLATIONS[language].marketStatus[marketStatus]}</span>
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
        </div>
    );
};
