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
            className="h-[50px] w-full flex items-center justify-between"
            style={{ backgroundColor: COLORS[theme].background }}
        >
            <div className="w-full max-w-[288px] px-4 mx-auto flex items-center justify-between">
                <button
                    className="w-[20px] h-[10px] ml-auto"
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
        </div>
    );
};