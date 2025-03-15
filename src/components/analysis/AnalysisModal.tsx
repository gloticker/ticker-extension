import { motion, AnimatePresence } from 'framer-motion';
import exitIcon from '/images/icon/exit.svg';
import { useTheme } from '../../hooks/useTheme';
import { COLORS } from '../../constants/theme';
import { useState, useEffect } from 'react';
import { useI18n } from '../../hooks/useI18n';
import { TRANSLATIONS } from '../../constants/i18n';
import { storage } from "../../utils/storage";
import { vmin, fontSize } from '../../utils/responsive';
import { vh } from '../../utils/responsive';

interface AnalysisModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface AnalysisData {
    content: string;
    timestamp: string;
}

const ANALYSIS_CACHE_KEY = 'market_analysis_cache';

const convertToKST = (timestamp: string): Date => {
    const nyTime = new Date(timestamp);
    const offset = nyTime.getMonth() >= 2 && nyTime.getMonth() <= 10 ? 13 : 14;
    return new Date(nyTime.getTime() + offset * 3600000);
};

const getLastUpdateTime = (current: Date): Date => {
    const referenceTime = new Date(current);
    const currentHour = current.getHours();

    if (currentHour < 8) {
        referenceTime.setDate(referenceTime.getDate() - 1);
        referenceTime.setHours(23, 0, 0, 0);
    } else if (currentHour < 15) {
        referenceTime.setHours(8, 0, 0, 0);
    } else if (currentHour < 23) {
        referenceTime.setHours(15, 0, 0, 0);
    } else {
        referenceTime.setHours(23, 0, 0, 0);
    }

    return referenceTime;
};

const shouldFetchNewData = (lastTimestamp: string) => {
    const now = new Date();
    const lastUpdateTime = getLastUpdateTime(now);
    const cacheTimeKST = convertToKST(lastTimestamp);

    const normalizeDate = (date: Date) => {
        const d = new Date(date);
        d.setMinutes(0, 0, 0);
        return d.getTime();
    };

    return normalizeDate(cacheTimeKST) < normalizeDate(lastUpdateTime);
};

const formatUpdateTime = (timestamp: string) => {
    const kstDate = convertToKST(timestamp);

    const year = kstDate.getFullYear();
    const month = String(kstDate.getMonth() + 1).padStart(2, '0');
    const day = String(kstDate.getDate()).padStart(2, '0');
    const hours = kstDate.getHours();
    const minutes = String(kstDate.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = String(hours % 12 || 12).padStart(2, '0');

    return `${year}-${month}-${day} ${displayHours}:${minutes} ${ampm} KST`;
};

export const AnalysisModal = ({ isOpen, onClose }: AnalysisModalProps) => {
    const { theme } = useTheme();
    const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { language } = useI18n();
    const [isInitialMount] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const fetchAnalysis = async () => {
            if (!isMounted) return;
            setIsLoading(true);
            setError(null);

            try {
                const response = await fetch('https://api.gloticker.live/v1/market/analysis');
                if (!response.ok) throw new Error('Failed to fetch analysis');
                const data = await response.json();

                if (!isMounted) return;

                const dataToCache = {
                    ...data,
                    timestamp: data.timestamp
                };

                await storage.set(ANALYSIS_CACHE_KEY, dataToCache);
                setAnalysis(dataToCache);
            } catch (err) {
                if (!isMounted) return;
                setError('분석 데이터를 불러오는데 실패했습니다.');
                console.error('Error fetching analysis:', err);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        if (isOpen) {
            const loadCachedData = async () => {
                const cached = await storage.get<AnalysisData>(ANALYSIS_CACHE_KEY);
                if (cached) {
                    const shouldFetch = shouldFetchNewData(cached.timestamp);
                    if (!shouldFetch) {
                        setAnalysis(cached);
                        return;
                    }
                }
                fetchAnalysis();
            };

            loadCachedData();
        }

        return () => {
            isMounted = false;
        };
    }, [isOpen, isInitialMount]);

    return (
        <AnimatePresence mode="wait">
            {isOpen && (
                <>
                    {/* 배경 오버레이 */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.1 }}
                        className="absolute inset-0"
                        style={{
                            zIndex: 40,
                            backgroundColor: `${COLORS[theme].background}99`
                        }}
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ y: -300, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -300, opacity: 0 }}
                        transition={{
                            duration: 0.15,
                            ease: "easeInOut"
                        }}
                        style={{
                            position: 'absolute',
                            top: vmin(60),
                            width: '100%',
                            maxWidth: vmin(266),
                            height: vh(230),
                            marginLeft: 'auto',
                            marginRight: 'auto',
                            left: 0,
                            right: 0,
                            borderRadius: vmin(10),
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                            zIndex: 50,
                            backgroundColor: COLORS[theme].surface,
                        }}
                    >
                        {/* 헤더 영역 */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: `${vmin(12)} ${vmin(16)}`
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <h2
                                    style={{
                                        fontSize: fontSize(20),
                                        color: COLORS[theme].text.primary,
                                        fontWeight: 400,
                                        letterSpacing: '1px'
                                    }}
                                >
                                    {TRANSLATIONS[language].modals.AIAnalysis}
                                </h2>
                                <div style={{ display: 'flex', gap: vmin(4), marginLeft: vmin(12), alignItems: 'center' }}>
                                    <motion.div
                                        style={{
                                            width: vmin(4),
                                            height: vmin(4),
                                            borderRadius: '50%',
                                            backgroundColor: COLORS[theme].primary
                                        }}
                                        animate={{
                                            opacity: [0.3, 1, 0.3],
                                            scale: [0.8, 1, 0.8],
                                        }}
                                        transition={{
                                            duration: 1.2,
                                            repeat: Infinity,
                                            delay: 0,
                                        }}
                                    />
                                    <motion.div
                                        style={{
                                            width: vmin(4),
                                            height: vmin(4),
                                            borderRadius: '50%',
                                            backgroundColor: COLORS[theme].primary
                                        }}
                                        animate={{
                                            opacity: [0.3, 1, 0.3],
                                            scale: [0.8, 1, 0.8],
                                        }}
                                        transition={{
                                            duration: 1.2,
                                            repeat: Infinity,
                                            delay: 0.4,
                                        }}
                                    />
                                    <motion.div
                                        style={{
                                            width: vmin(4),
                                            height: vmin(4),
                                            borderRadius: '50%',
                                            backgroundColor: COLORS[theme].primary
                                        }}
                                        animate={{
                                            opacity: [0.3, 1, 0.3],
                                            scale: [0.8, 1, 0.8],
                                        }}
                                        transition={{
                                            duration: 1.2,
                                            repeat: Infinity,
                                            delay: 0.8,
                                        }}
                                    />
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                style={{
                                    width: vmin(20),
                                    height: vmin(20),
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <img
                                    src={exitIcon}
                                    alt="close"
                                    style={{
                                        width: vmin(14),
                                        height: vmin(14),
                                        filter: `brightness(${theme === 'dark' ? 1 : 0})`
                                    }}
                                />
                            </button>
                        </div>

                        {/* 컨텐츠 영역 */}
                        <div style={{ height: `calc(100% - ${vmin(48)})` }}>
                            {isLoading ? (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    height: '100%'
                                }}>
                                    <div style={{
                                        animation: 'spin 1s linear infinite',
                                        borderRadius: '50%',
                                        height: vmin(24),
                                        width: vmin(24),
                                        border: `${vmin(2)} solid transparent`,
                                        borderTopColor: COLORS[theme].primary,
                                        borderRightColor: COLORS[theme].primary
                                    }} />
                                </div>
                            ) : error ? (
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        height: '100%',
                                        color: COLORS[theme].text.secondary
                                    }}
                                >
                                    {error}
                                </div>
                            ) : analysis ? (
                                <div style={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    padding: `0 ${vmin(16)}`
                                }}>
                                    <div style={{
                                        flex: 1,
                                        minHeight: 0,
                                        overflowY: 'auto'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: vmin(12)
                                        }}>
                                            {analysis.content.split('. ').map((sentence, index, array) => (
                                                <p
                                                    key={index}
                                                    style={{
                                                        fontSize: fontSize(14),
                                                        lineHeight: 1.5,
                                                        color: COLORS[theme].text.primary,
                                                        margin: 0
                                                    }}
                                                >
                                                    {sentence}
                                                    {index < array.length - 1 && '.'}
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                    <div style={{
                                        height: vmin(40),
                                        display: 'flex',
                                        justifyContent: 'flex-end',
                                        alignItems: 'center',
                                        paddingBottom: vmin(16)
                                    }}>
                                        <span
                                            style={{
                                                fontSize: fontSize(12),
                                                color: COLORS[theme].text.secondary
                                            }}
                                        >
                                            {formatUpdateTime(analysis.timestamp)}
                                        </span>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
