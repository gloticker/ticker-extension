import { useEffect, useState } from "react";
import { Theme } from "../types/theme";
import { storage } from "../utils/storage";
import { ThemeContext } from "./themeContext";

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [theme, setTheme] = useState<Theme>(() => {
        // 초기 상태는 dark로 설정
        return "dark";
    });

    // 컴포넌트 마운트 시 저장된 테마 불러오기
    useEffect(() => {
        const loadTheme = async () => {
            const savedTheme = await storage.get<Theme>("theme");
            if (savedTheme) {
                setTheme(savedTheme);
            } else {
                // 저장된 테마가 없으면 dark로 저장
                await storage.set("theme", "dark");
            }
        };
        loadTheme();
    }, []);

    const toggleTheme = async () => {
        const newTheme = theme === "light" ? "dark" : "light";
        await storage.set("theme", newTheme);
        setTheme(newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}; 