import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ThemeProvider } from "./contexts/ThemeProvider";
import "./styles/globals.css";
import { I18nProvider } from "./contexts/I18nProvider";
import { DetailsProvider } from "./contexts/DetailsProvider";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error('Failed to find the root element');

// 전역 에러 핸들링
window.onerror = (message, source, lineno, colno, error) => {
  console.error('Global error:', { message, source, lineno, colno, error });
  return false;
};

// 비동기 에러 핸들링
window.onunhandledrejection = (event) => {
  console.error('Unhandled promise rejection:', event.reason);
};

ReactDOM.createRoot(rootElement).render(
  <I18nProvider>
    <ThemeProvider>
      <DetailsProvider>
        <App />
      </DetailsProvider>
    </ThemeProvider>
  </I18nProvider>
);
