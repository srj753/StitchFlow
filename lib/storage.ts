import { Platform } from 'react-native';
import type { StateStorage } from 'zustand/middleware';

const createWebStorage = (): StateStorage => {
  return {
    getItem: (name) => {
      if (typeof window === 'undefined') return null;
      return window.localStorage.getItem(name);
    },
    setItem: (name, value) => {
      if (typeof window === 'undefined') return;
      window.localStorage.setItem(name, value);
    },
    removeItem: (name) => {
      if (typeof window === 'undefined') return;
      window.localStorage.removeItem(name);
    },
  };
};

// Use a synchronous storage for Web if possible to avoid hydration lag
export const resolveStateStorage = (): StateStorage => {
  if (Platform.OS === 'web') {
    return createWebStorage();
  }
  // For Native, we'd usually use AsyncStorage which is async.
  // However, for this snippet, we assume the caller handles AsyncStorage import elsewhere
  // or we can dynamically import it.
  // Given the current setup, we'll assume this file is mostly ensuring Web works.
  // If we need native AsyncStorage, we should import it.
  
  // Re-implementing native logic if needed, but focusing on Web fix:
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    return AsyncStorage;
  } catch (e) {
    // Fallback or mock for SSR/Testing if needed
    return createWebStorage();
  }
};
