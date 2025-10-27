import { createRoot } from "react-dom/client";
import "./i18n"; // Initialize i18n before App
// Removed duplicate i18n config to prevent overriding resources
import App from "./App.tsx";
import "./index.css";
import { reportWebVitals, sendVitalsToAnalytics } from "./utils/webVitals";
import { setupGlobalErrorHandling } from "./utils/errorTracking";

// Set up global error tracking
setupGlobalErrorHandling();

// QA: Build timestamp for verification
const buildTimestamp = new Date().toISOString();
console.log('🔧 Build:', buildTimestamp);
document.body?.setAttribute('data-build', buildTimestamp);

createRoot(document.getElementById("root")!).render(<App />);

// Phase 7: Defer analytics until after page is interactive
if ('requestIdleCallback' in window) {
  requestIdleCallback(() => {
    reportWebVitals(sendVitalsToAnalytics);
  }, { timeout: 2000 });
} else {
  setTimeout(() => {
    reportWebVitals(sendVitalsToAnalytics);
  }, 2000);
}
