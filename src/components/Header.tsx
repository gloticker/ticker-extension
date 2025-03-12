import { useTheme } from '../hooks/useTheme';
import { COLORS } from '../constants/theme';
import { useState, useEffect } from 'react';
import { format, toZonedTime } from 'date-fns-tz';
import { useI18n } from '../hooks/useI18n';
import { TRANSLATIONS } from '../constants/i18n';
import { isMarketHoliday } from '../constants/marketHolidays';
import { MARKET_TIMES } from '../constants/marketTimes';
import { storage } from "../utils/storage";
import { vmin, fontSize } from '../utils/responsive';

interface HeaderProps {
    isSettings?: boolean;
    onSettingsClick: () => void;
    onAnalysisClick: () => void;
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

export const Header = ({ isSettings, onSettingsClick, onAnalysisClick }: HeaderProps) => {
    const { theme } = useTheme();
    const { language } = useI18n();
    const nyDateTime = useNYDateTime();
    const [marketStatus, setMarketStatus] = useState<MarketStatusType>(() =>
        getMarketStatus(nyDateTime.date, nyDateTime.minutes)
    );
    const [showStatus, setShowStatus] = useState(false);

    // 마켓 상태 업데이트
    useEffect(() => {
        const newStatus = getMarketStatus(nyDateTime.date, nyDateTime.minutes);
        if (newStatus !== marketStatus) {
            setMarketStatus(newStatus);
        }
    }, [nyDateTime.minutes, nyDateTime.date, marketStatus]);

    // 초기 showStatus 로드
    useEffect(() => {
        const loadShowStatus = async () => {
            const saved = await storage.get<boolean>('showMarketStatus');
            if (saved !== null) {
                setShowStatus(saved);
            }
        };
        loadShowStatus();
    }, []);

    // showStatus 변경시 저장
    useEffect(() => {
        storage.set('showMarketStatus', showStatus);
    }, [showStatus]);

    const primaryColor = COLORS[theme].text.primary;
    const brightness = parseInt(primaryColor.slice(1), 16) / 0xFFFFFF;

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
            style={{
                height: vmin(50),
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: COLORS[theme].background
            }}
        >
            <div style={{
                width: '100%',
                maxWidth: vmin(266),
                padding: `0 ${vmin(12)}px`,
                marginLeft: 'auto',
                marginRight: 'auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                {!isSettings && (
                    <>
                        <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                            <button
                                style={{
                                    width: vmin(20),
                                    height: vmin(20),
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                                onClick={() => {
                                    setShowStatus((prev: boolean) => !prev);
                                }}
                            >
                                <img
                                    src={getMarketIcon()}
                                    alt="market status"
                                    style={{
                                        width: vmin(18),
                                        height: vmin(18),
                                        filter: `brightness(${brightness})`
                                    }}
                                />
                            </button>
                            <div style={{
                                position: 'absolute',
                                left: vmin(24),
                                whiteSpace: 'nowrap',
                                transition: 'opacity 300ms',
                                pointerEvents: 'none',
                                height: vmin(50),
                                color: COLORS[theme].text.primary,
                                opacity: showStatus ? 1 : 0,
                            }}>
                                <div style={{
                                    position: 'absolute',
                                    transform: 'translateY(-50%)',
                                    top: '50%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-end'
                                }}>
                                    <span style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        fontSize: fontSize(12)
                                    }}>
                                        <span style={{
                                            display: 'inline-block',
                                            width: vmin(52),
                                            fontVariantNumeric: 'tabular-nums',
                                            textAlign: 'right'
                                        }}>
                                            {nyDateTime.time}
                                        </span>
                                        <span style={{ marginLeft: vmin(4) }}>
                                            {nyDateTime.period}
                                        </span>
                                    </span>
                                    <span style={{
                                        fontSize: fontSize(10),
                                        marginTop: vmin(4)
                                    }}>
                                        {TRANSLATIONS[language].marketStatus[marketStatus]}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <button
                            style={{
                                width: vmin(20),
                                height: vmin(20),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            onClick={onAnalysisClick}
                        >
                            <img
                                src="/images/icon/ai.svg"
                                alt="ai"
                                style={{
                                    width: vmin(18),
                                    height: vmin(18),
                                    filter: `brightness(${brightness})`
                                }}
                            />
                        </button>
                    </>
                )}

                <button
                    style={{
                        width: isSettings ? vmin(20) : vmin(20),
                        height: isSettings ? vmin(20) : vmin(20),
                        marginLeft: isSettings ? 'auto' : undefined,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    onClick={onSettingsClick}
                >
                    <img
                        src={isSettings ? "/images/icon/back.svg" : "/images/icon/setting.svg"}
                        alt={isSettings ? "back" : "settings"}
                        style={{
                            width: isSettings ? vmin(14) : vmin(18),
                            height: isSettings ? vmin(14) : vmin(18),
                            filter: `brightness(${brightness})`
                        }}
                    />
                </button>
            </div>
        </div>
    );
};
