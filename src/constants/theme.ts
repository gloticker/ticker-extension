export const COLORS = {
  light: {
    primary: "#1E7094",
    danger: "#FF253B",
    background: "#DBDBDB",
    surface: "#E8E8E8",
    icon: "1F1F1F",
    text: {
      primary: "#1F1F1F",
      secondary: "#838383",
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
