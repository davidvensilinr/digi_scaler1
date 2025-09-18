"use client";

import { useEffect } from "react";

// Optional service worker registration helper that also handles updates
export default function SwRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    const register = async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js");
        // Listen for waiting service worker to prompt refresh
        if (reg.waiting) {
          console.log("Service worker waiting (update ready)");
        }
        reg.addEventListener("updatefound", () => {
          const newSW = reg.installing;
          if (!newSW) return;
          newSW.addEventListener("statechange", () => {
            if (newSW.state === "installed" && navigator.serviceWorker.controller) {
              console.log("New content is available; please refresh.");
            }
          });
        });
      } catch (e) {
        console.warn("SW registration failed:", e);
      }
    };

    register();
  }, []);

  return null;
}
