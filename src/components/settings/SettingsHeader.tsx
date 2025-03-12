import { useTheme } from '../../hooks/useTheme';
import { COLORS } from '../../constants/theme';
import { vmin } from '../../utils/responsive';

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
                <button
                    style={{
                        width: vmin(20),
                        height: vmin(20),
                        marginLeft: 'auto',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    onClick={onBackClick}
                >
                    <img
                        src="/images/icon/back.svg"
                        alt="back"
                        style={{
                            width: vmin(18),
                            height: vmin(18),
                            filter: `brightness(${brightness})`
                        }}
                    />
                </button>
            </div>
        </div>
    );
};