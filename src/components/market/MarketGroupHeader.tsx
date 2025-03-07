import { useTheme } from '../../contexts/ThemeContext';
import { COLORS } from '../../constants/theme';

interface MarketGroupHeaderProps {
    type: string;
    isExpanded: boolean;
    onToggle: () => void;
}

export const MarketGroupHeader = ({ type, isExpanded, onToggle }: MarketGroupHeaderProps) => {
    const { theme } = useTheme();
    const primaryColor = COLORS[theme].text.primary;
    const brightness = parseInt(primaryColor.slice(1), 16) / 0xFFFFFF;

    return (
        <div
            className="w-full max-w-100 h-10 px-4 mx-auto flex items-center justify-between text-xl mb-2.5 cursor-pointer"
            onClick={onToggle}
            style={{ color: COLORS[theme].text.primary }}
        >
            <span>{type}</span>
            <img
                src={`/images/icon/${isExpanded ? 'close' : 'open'}.svg`}
                alt={isExpanded ? 'close' : 'open'}
                className="mr-[5px]"
                style={{
                    filter: `brightness(${brightness})`
                }}
            />
        </div>
    );
};
