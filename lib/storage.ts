import type { StateStorage } from 'zustand/middleware';

const createWebStorage = (): StateStorage => {
  return {
    getItem: async (name) => {
      if (typeof window === 'undefined') return null;
      return window.localStorage.getItem(name);
    },
    setItem: async (name, value) => {
      if (typeof window === 'undefined') return;
      window.localStorage.setItem(name, value);
    },
    removeItem: async (name) => {
      if (typeof window === 'undefined') return;
      window.localStorage.removeItem(name);
    },
  };
};

export const resolveStateStorage = (): StateStorage => createWebStorage();


