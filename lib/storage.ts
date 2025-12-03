import { Platform } from 'react-native';
import type { StateStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  // For Native, use AsyncStorage
  return AsyncStorage;
};
