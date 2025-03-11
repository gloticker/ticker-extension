import { motion, AnimatePresence } from 'framer-motion';
import { MarketGroupHeader } from './MarketGroupHeader';
import { MarketItem } from './MarketItem';
import { MarketType, MarketData } from '../../types/market';
import { useDetails } from '../../hooks/useDetails';

interface MarketGroupProps {
    type: MarketType;
    data: Record<string, MarketData>;
    chartData: Record<string, Record<string, { close: string }>>;
    isExpanded: boolean;
    onToggle: () => void;
    isInitialLoad: boolean;
}

export const MarketGroup = ({ type, data, chartData, isExpanded, onToggle, isInitialLoad }: MarketGroupProps) => {
    const { isDetailsVisible } = useDetails();

    return (
        <div>
            <MarketGroupHeader type={type} isExpanded={isExpanded} onToggle={onToggle} />
            <AnimatePresence initial={false}>
                {isExpanded && (
                    <motion.div
                        initial={isInitialLoad ? false : { height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ overflow: 'hidden' }}
                    >
                        {Object.entries(data).map(([symbol, marketData]) => (
                            <MarketItem
                                key={symbol}
                                symbol={symbol}
                                marketData={marketData}
                                chartData={chartData[symbol] || {}}
                                isDetailsVisible={isDetailsVisible}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}; 