import { useState, ReactNode } from 'react';
import { Language, I18nContext } from '../constants/i18n';

export const I18nProvider = ({ children }: { children: ReactNode }) => {
    const [language, setLanguage] = useState<Language>(() => {
        const savedLanguage = localStorage.getItem('language');
        return (savedLanguage as Language) || 'en';
    });

    const toggleLanguage = () => {
        setLanguage(prev => {
            const newLanguage = prev === 'ko' ? 'en' : 'ko';
            localStorage.setItem('language', newLanguage);
            return newLanguage;
        });
    };

    return (
        <I18nContext.Provider value={{ language, toggleLanguage }}>
            {children}
        </I18nContext.Provider>
    );
};
