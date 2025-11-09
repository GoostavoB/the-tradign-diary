import { useEffect } from "react";
import { swCleanup } from "@/utils/swCleanup";
import { toast } from "sonner";

// Runs a deep cache cleanup when certain URL params are present, then reloads
export const CacheBootstrap = () => {
  useEffect(() => {
    const url = new URL(window.location.href);
    const shouldClear = url.searchParams.has("clear-cache") || url.searchParams.has("no-sw") || url.searchParams.has("no-cache");

    if (!shouldClear) return;

    const deepClean = async () => {
      try {
        console.log("[Cache] Deep cleanup requested via URL param");
        // Run existing aggressive cleanup
        swCleanup();

        // Extra safety: clear everything we reasonably can
        try {
          if ("caches" in window) {
            const keys = await caches.keys();
            await Promise.all(keys.map((k) => caches.delete(k)));
          }
        } catch (_) {}

        try {
          if ("serviceWorker" in navigator) {
            const regs = await navigator.serviceWorker.getRegistrations();
            await Promise.all(regs.map((r) => r.unregister()));
          }
        } catch (_) {}

        try {
          localStorage.clear();
        } catch (_) {}
        try {
          sessionStorage.clear();
        } catch (_) {}

        toast.success("Cache cleared", { description: "Reloading with a clean state..." });
      } catch (err) {
        console.error("[Cache] Deep cleanup failed", err);
      } finally {
        // Remove params to avoid reload loop
        url.searchParams.delete("clear-cache");
        url.searchParams.delete("no-sw");
        url.searchParams.delete("no-cache");
        window.history.replaceState({}, "", url.toString());
        setTimeout(() => window.location.reload(), 200);
      }
    };

    void deepClean();
  }, []);

  return null;
};
