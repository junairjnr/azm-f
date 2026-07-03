'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    workbox?: {
      register: () => void;
    };
  }
}

export default function RegisterPWA() {
  useEffect(() => {
    if ('serviceWorker' in navigator && window.workbox) {
      window.workbox.register();
    }
  }, []);

  return null;
}
