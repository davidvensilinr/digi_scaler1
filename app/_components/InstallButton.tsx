'use client';

import { useState, useEffect, useCallback } from 'react';

// Extend Window interface to include our custom properties
declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
  interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{
      outcome: 'accepted' | 'dismissed';
      platform: string;
    }>;
    prompt(): Promise<void>;
  }
  interface Window {
    deferredPrompt?: BeforeInstallPromptEvent;
  }
}

// Debug function to log install button state
const debug = (...args: any[]) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('[InstallButton]', ...args);
  }
};

export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  // Check if the app is installed
  const checkIfPWAInstalled = useCallback(() => {
    // For iOS
    const isIos = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      return /iphone|ipad|ipod/.test(userAgent);
    };
    
    // For iOS, check if in standalone mode
    if (isIos() && (window.navigator as any).standalone) {
      return true;
    }
    
    // For Android/Chrome
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return true;
    }
    
    // Check if the app is running as an installed PWA
    if (window.matchMedia('(display-mode: standalone)').matches || 
        (window.navigator as any).standalone || 
        document.referrer.includes('android-app://')) {
      return true;
    }
    
    return false;
  }, []);

  // Handle the beforeinstallprompt event
  const handleBeforeInstallPrompt = useCallback((e: BeforeInstallPromptEvent) => {
    debug('beforeinstallprompt event fired');
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    
    // Stash the event so it can be triggered later
    window.deferredPrompt = e;
    setDeferredPrompt(e);
    
    // Show the install button
    setIsVisible(true);
    
    // Log that the PWA can be installed
    debug('PWA can be installed');
    
    // For debugging
    console.log('PWA installation available');
  }, []);

  // Handle app installed event
  const handleAppInstalled = useCallback(() => {
    debug('App was installed');
    setIsInstalled(true);
    setIsVisible(false);
    setDeferredPrompt(null);
  }, []);

  useEffect(() => {
    debug('Setting up PWA installation listeners');
    
    // Only run on client-side
    if (typeof window === 'undefined') {
      debug('Not in browser environment');
      return;
    }
    
    // Check if already installed
    if (checkIfPWAInstalled()) {
      debug('App is already installed');
      setIsInstalled(true);
      setIsVisible(false);
      return;
    }

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Clean up
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    debug('Install button clicked');
    
    if (!deferredPrompt) {
      debug('No installation prompt available');
      return;
    }
    
    try {
      // Show the installation prompt
      debug('Showing installation prompt');
      deferredPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      debug(`User ${outcome} the installation`);
      
      if (outcome === 'accepted') {
        debug('User accepted the installation');
      } else {
        debug('User dismissed the installation');
      }
      
      // Clear the deferredPrompt variable
      setDeferredPrompt(null);
      setIsVisible(false);
      
    } catch (error) {
      console.error('Error during installation:', error);
      debug('Error during installation:', error);
    }
  };

  useEffect(() => {
    debug('isVisible changed:', isVisible);
    debug('deferredPrompt exists:', !!deferredPrompt);
  }, [isVisible, deferredPrompt]);

  // For debugging
  useEffect(() => {
    console.log('Install button state:', { isInstalled, isVisible, hasDeferredPrompt: !!deferredPrompt });
  }, [isInstalled, isVisible, deferredPrompt]);

  // Don't show the button if the app is already installed or if it's not visible
  if (isInstalled || !isVisible) {
    debug('Not rendering button: isInstalled:', isInstalled, 'isVisible:', isVisible);
    return null;
  }

  return (
    <button
      onClick={handleInstallClick}
      className="fixed bottom-4 right-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2 transition-all"
      aria-label="Install app"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
      </svg>
      Install App
    </button>
  );
}
