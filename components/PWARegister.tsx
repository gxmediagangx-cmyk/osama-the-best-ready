'use client';

import { useEffect } from 'react';

export function PWARegister() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    // In development mode, unregister old ServiceWorkers and clear cache to prevent chunk hash collisions
    if (process.env.NODE_ENV === 'development') {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister();
        }
      });
      if ('caches' in window) {
        caches.keys().then((names) => {
          for (const name of names) {
            caches.delete(name);
          }
        });
      }
      return;
    }

    // In production, register the service worker
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        // If an update is found, activate it
        reg.onupdatefound = () => {
          const installingWorker = reg.installing;
          if (installingWorker) {
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content available, reload safe
              }
            };
          }
        };
      })
      .catch((err) => {
        console.warn('ServiceWorker registration error:', err);
      });
  }, []);

  return null;
}
