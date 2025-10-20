import { createRoot } from "react-dom/client";
import "./i18n"; // Initialize i18n before App
import App from "./App.tsx";
import "./index.css";
import { reportWebVitals, sendVitalsToAnalytics } from "./utils/webVitals";

createRoot(document.getElementById("root")!).render(<App />);

// Report web vitals for performance monitoring
reportWebVitals(sendVitalsToAnalytics);
