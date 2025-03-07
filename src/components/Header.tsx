import { useTheme, COLORS } from '../constants/theme';

interface HeaderProps {
    isSettings?: boolean;
    onSettingsClick: () => void;
}

export const Header = ({ isSettings, onSettingsClick }: HeaderProps) => {
    const { theme } = useTheme();
    const primaryColor = COLORS[theme].text.primary;
    const brightness = parseInt(primaryColor.slice(1), 16) / 0xFFFFFF;

    return (
        <div
            className="h-[50px] px-4 flex items-center justify-between"
            style={{ backgroundColor: COLORS[theme].background }}
        >
            {!isSettings && (
                <>
                    <button className="w-[18px] h-[18px]">
                        <img
                            src="/images/icon/market-closed.svg"
                            alt="market closed"
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
