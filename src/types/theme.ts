import { COLORS } from "../constants/theme";

export type Theme = "light" | "dark";

export type ThemeColors = typeof COLORS.light & typeof COLORS.dark;

export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}
