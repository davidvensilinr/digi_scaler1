"use client";

import { useEffect } from "react";

// Service worker registration helper that handles updates and installation
export default function SwRegister() {
  useEffect(() => {
    // Only run on client-side
    if (typeof window === "undefined") {
      console.log("[Service Worker] Not running in browser environment");
      return;
    }

    // Check for service worker support
    if (!("serviceWorker" in navigator)) {
      console.log("[Service Worker] Service workers are not supported");
      return;
    }

    // Check if we're in development mode
    const isLocalhost = Boolean(
      window.location.hostname === 'localhost' ||
      window.location.hostname === '[::1]' ||
      window.location.hostname.match(
        /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
      )
    );

    // In development, don't register service worker
    if (process.env.NODE_ENV === 'development' && isLocalhost) {
      console.log('[Service Worker] Running in development mode - service worker disabled');
      return;
    }

    const registerServiceWorker = async () => {
      try {
        console.log("[Service Worker] Registering service worker...");
        
        // Unregister any existing service workers first
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (let registration of registrations) {
          console.log('[Service Worker] Unregistering existing service worker');
          await registration.unregister();
        }

        // Clear all caches
        if ('caches' in window) {
          const cacheNames = await caches.keys();
          await Promise.all(
            cacheNames.map(cacheName => {
              console.log('[Service Worker] Deleting cache:', cacheName);
              return caches.delete(cacheName);
            })
          );
        }

        // Register the service worker
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none'
        });

        console.log('[Service Worker] Registration successful, scope:', registration.scope);

        // Check if the service worker is controlling the page
        if (navigator.serviceWorker.controller) {
          console.log('[Service Worker] Active service worker found');
        } else {
          console.log('[Service Worker] No active service worker found');
        }

        // Listen for updates
        registration.addEventListener('updatefound', () => {
          console.log('[Service Worker] Update found...');
          const newWorker = registration.installing;
          
          if (!newWorker) return;
          
          newWorker.addEventListener('statechange', () => {
            console.log(`[Service Worker] New worker state: ${newWorker.state}`);
            
            if (newWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                console.log('[Service Worker] New content is available; please refresh.');
                // You could show a notification to the user here
              } else {
                console.log('[Service Worker] Content is now available offline!');
              }
            }
          });
        });

        // Handle controller change (when a new service worker takes over)
        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (refreshing) return;
          console.log('[Service Worker] Controller changed, reloading...');
          window.location.reload();
          refreshing = true;
        });

      } catch (error) {
        console.error('[Service Worker] Registration failed:', error);
      }
    };

    // Register service worker when the page has loaded
    const handleLoad = () => {
      if (document.readyState === 'complete') {
        registerServiceWorker();
      }
    };

    // Add event listeners
    window.addEventListener('load', handleLoad);
    
    // Also try to register immediately if the page is already loaded
    if (document.readyState === 'complete') {
      registerServiceWorker();
    }

    // Clean up
    return () => {
      window.removeEventListener('load', handleLoad);
    };
  }, []);

  return null;
}
