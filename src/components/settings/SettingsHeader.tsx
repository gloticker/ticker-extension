import { useTheme, COLORS } from '../../constants/theme';

interface SettingsHeaderProps {
    onBackClick: () => void;
}

export const SettingsHeader = ({ onBackClick }: SettingsHeaderProps) => {
    const { theme } = useTheme();
    const secondaryColor = COLORS[theme].text.primary;
    // HEX를 RGB로 변환하고 밝기 계산
    const brightness = parseInt(secondaryColor.slice(1), 16) / 0xFFFFFF;

    return (
        <div
            className="h-[50px] px-4 flex items-center justify-end w-[288px]"
            style={{ backgroundColor: COLORS[theme].background }}
        >
            <button
                className="w-[20px] h-[10px]"
                onClick={onBackClick}
            >
                <img
                    src="/images/icon/back.svg"
                    alt="back"
                    style={{
                        filter: `brightness(${brightness})`
                    }}
                />
            </button>
        </div>
    );
};