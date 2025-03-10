import { motion, AnimatePresence } from 'framer-motion';
import exitIcon from '/images/icon/exit.svg';
import { useTheme, COLORS } from '../../constants/theme';
import { useState, useEffect } from 'react';
import { useI18n, TRANSLATIONS } from '../../constants/i18n';

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

                localStorage.setItem(ANALYSIS_CACHE_KEY, JSON.stringify(dataToCache));
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
            const cached = localStorage.getItem(ANALYSIS_CACHE_KEY);

            if (cached) {
                const parsedCache = JSON.parse(cached);
                const shouldFetch = shouldFetchNewData(parsedCache.timestamp);

                if (!shouldFetch) {
                    setAnalysis(parsedCache);
                    return;
                }
            }

            fetchAnalysis();
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
                        className="absolute top-[60px] w-full max-w-[266px] h-[200px] mx-auto left-0 right-0 rounded-lg shadow-lg"
                        style={{
                            zIndex: 50,
                            backgroundColor: COLORS[theme].surface,
                        }}
                    >
                        {/* 헤더 영역 */}
                        <div className="flex justify-between items-center px-4 py-3">
                            <div className="flex items-center">
                                <h2
                                    className="text-xl"
                                    style={{
                                        color: COLORS[theme].text.primary,
                                        fontWeight: 400
                                    }}
                                >
                                    {TRANSLATIONS[language].modals.AIAnalysis}
                                </h2>
                                <div className="flex gap-1 ml-3 items-center">
                                    <motion.div
                                        className="w-1 h-1 rounded-full"
                                        style={{ backgroundColor: COLORS[theme].primary }}
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
                                        className="w-1 h-1 rounded-full"
                                        style={{ backgroundColor: COLORS[theme].primary }}
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
                                        className="w-1 h-1 rounded-full"
                                        style={{ backgroundColor: COLORS[theme].primary }}
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
                                className="w-5 h-5 flex items-center justify-center"
                            >
                                <img
                                    src={exitIcon}
                                    alt="close"
                                    className="w-3.5 h-3.5"
                                    style={{
                                        filter: `brightness(${theme === 'dark' ? 1 : 0})`
                                    }}
                                />
                            </button>
                        </div>

                        {/* 컨텐츠 영역 */}
                        <div className="h-[calc(100%-4rem)]">
                            {isLoading ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
                                </div>
                            ) : error ? (
                                <div
                                    className="flex items-center justify-center h-full"
                                    style={{ color: COLORS[theme].text.secondary }}
                                >
                                    {error}
                                </div>
                            ) : analysis ? (
                                <div className="h-full flex flex-col px-4">
                                    <div className="flex-1 min-h-0 overflow-y-auto">
                                        <div className="space-y-3 text-sm leading-relaxed"
                                            style={{ color: COLORS[theme].text.primary }}
                                        >
                                            {analysis.content.split('. ').map((sentence, index, array) => (
                                                <p key={index}>
                                                    {sentence}
                                                    {index < array.length - 1 && '.'}
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="h-8 flex justify-end items-center">
                                        <span
                                            className="text-xs"
                                            style={{ color: COLORS[theme].text.secondary }}
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
