
"use client";

import { useEffect } from "react";

/**
 * A utility component that synchronizes the CSS --primary variable 
 * across the entire application based on user selection in localStorage.
 */
export default function ThemeColorSynchronizer() {
  useEffect(() => {
    // Initial sync on mount
    const savedColor = localStorage.getItem('fitcoin_theme_color');
    if (savedColor) {
      document.documentElement.style.setProperty('--primary', savedColor);
    }

    // Listen for storage changes (if user has multiple tabs open)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'fitcoin_theme_color' && e.newValue) {
        document.documentElement.style.setProperty('--primary', e.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return null;
}
