import { useEffect, useState } from "react";
import { Language } from "../types/i18n";
import { storage } from "../utils/storage";
import { I18nContext } from "./i18nContext";

export const I18nProvider = ({ children }: { children: React.ReactNode }) => {
    const [language, setLanguage] = useState<Language>(() => {
        // 초기 상태는 en으로 설정
        return "en";
    });

    // 컴포넌트 마운트 시 저장된 언어 설정 불러오기
    useEffect(() => {
        const loadLanguage = async () => {
            const savedLanguage = await storage.get<Language>("language");
            if (savedLanguage) {
                setLanguage(savedLanguage);
            } else {
                // 저장된 언어 설정이 없으면 en으로 저장
                await storage.set("language", "en");
            }
        };
        loadLanguage();
    }, []);

    const toggleLanguage = async () => {
        const newLanguage = language === "ko" ? "en" : "ko";
        await storage.set("language", newLanguage);
        setLanguage(newLanguage);
    };

    return (
        <I18nContext.Provider value={{ language, toggleLanguage }}>
            {children}
        </I18nContext.Provider>
    );
};
