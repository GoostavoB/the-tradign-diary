import { createRoot } from "react-dom/client";
import "./i18n"; // Initialize i18n before App
// Removed duplicate i18n config to prevent overriding resources
import App from "./App.tsx";
import "./index.css";
import { reportWebVitals, sendVitalsToAnalytics } from "./utils/webVitals";
import { setupGlobalErrorHandling } from "./utils/errorTracking";

// Set up global error tracking
setupGlobalErrorHandling();

createRoot(document.getElementById("root")!).render(<App />);

// Report web vitals for performance monitoring
reportWebVitals(sendVitalsToAnalytics);
