import { createContext, useContext } from "react";

export const COLORS = {
  light: {
    primary: "#1E7094",
    danger: "#FF5162",
    background: "#DBDBDB",
    surface: "#E8E8E8",
    icon: "1F1F1F",
    text: {
      primary: "#1F1F1F",
      secondary: "#ACACAC",
    },
  },
  dark: {
    primary: "#C9F31E",
    danger: "#FA374B",
    background: "#131313",
    surface: "#1F1F1F",
    icon: "FFFFFF",
    text: {
      primary: "#FFFFFF",
      secondary: "#949494",
    },
  },
} as const;

export type Theme = "light" | "dark";

export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
