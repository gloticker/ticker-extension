import { useTheme } from '../../hooks/useTheme';
import { COLORS } from '../../constants/theme';
import { vmin } from '../../utils/responsive';
import { useState, useEffect } from 'react';
import feedbackIcon from '/images/icon/feedback.svg';
import backIcon from '/images/icon/back.svg';

interface SettingsHeaderProps {
    onBackClick: () => void;
}

export const SettingsHeader = ({ onBackClick }: SettingsHeaderProps) => {
    const { theme } = useTheme();
    const secondaryColor = COLORS[theme].text.primary;
    const brightness = parseInt(secondaryColor.slice(1), 16) / 0xFFFFFF;
    const [isImageLoaded, setIsImageLoaded] = useState(true);

    const handleFeedbackClick = () => {
        window.open('https://forms.gle/Z7bUrnUd97Ka9Rcw8', '_blank');
    };

    useEffect(() => {
        setIsImageLoaded(false);
        const feedbackImg = new Image();
        const backImg = new Image();

        feedbackImg.src = feedbackIcon;
        backImg.src = backIcon;

        Promise.all([
            new Promise((resolve) => {
                feedbackImg.onload = resolve;
                feedbackImg.onerror = () => {
                    console.error('Feedback icon load failed');
                    resolve(null);
                };
            }),
            new Promise((resolve) => {
                backImg.onload = resolve;
                backImg.onerror = () => {
                    console.error('Back icon load failed');
                    resolve(null);
                };
            })
        ]).then(() => setIsImageLoaded(true));
    }, []);

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
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    onClick={handleFeedbackClick}
                >
                    <img
                        src={feedbackIcon}
                        alt="feedback"
                        style={{
                            width: vmin(18),
                            height: vmin(18),
                            filter: `brightness(${brightness})`,
                            opacity: isImageLoaded ? 1 : 0,
                            transition: 'opacity 0.2s'
                        }}
                    />
                </button>
                <button
                    style={{
                        width: vmin(20),
                        height: vmin(20),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    onClick={onBackClick}
                >
                    <img
                        src={backIcon}
                        alt="back"
                        style={{
                            width: vmin(18),
                            height: vmin(18),
                            filter: `brightness(${brightness})`,
                            opacity: isImageLoaded ? 1 : 0,
                            transition: 'opacity 0.2s'
                        }}
                    />
                </button>
            </div>
        </div>
    );
};