'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';

// Debug function
const debug = (...args: any[]) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('[InstallButtonWrapper]', ...args);
  }
};

// This is a client component that wraps the InstallButton
const InstallButton = dynamic(
  () => {
    debug('Dynamically importing InstallButton');
    return import('./InstallButton');
  },
  { 
    ssr: false,
    loading: () => {
      debug('Loading InstallButton...');
      return null;
    }
  }
);

export default function InstallButtonWrapper() {
  useEffect(() => {
    debug('InstallButtonWrapper mounted');
    return () => debug('InstallButtonWrapper unmounted');
  }, []);

  return <InstallButton />;
}
