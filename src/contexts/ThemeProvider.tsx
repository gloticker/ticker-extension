import { useState, ReactNode } from 'react';
import { ThemeContext, Theme } from '../constants/theme';
import { DEFAULT_CONFIG } from '../constants/config';

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const [theme, setTheme] = useState<Theme>(() => {
        const savedTheme = localStorage.getItem('theme') as Theme;
        return savedTheme || DEFAULT_CONFIG.theme;  // 저장된 값이 없으면 DEFAULT_CONFIG 사용
    });

    const toggleTheme = () => {
        setTheme(prev => {
            const newTheme = prev === 'light' ? 'dark' : 'light';
            localStorage.setItem('theme', newTheme);
            return newTheme;
        });
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}; 