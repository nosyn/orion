import { Credential } from '@/types/db.type';
import { createWithEqualityFn as create } from 'zustand/traditional';
import { persist } from 'zustand/middleware';

type AppState = {
  sessionToken: string | null;
  credentials: Credential[];
};

type AppActions = {
  setSessionToken: (t: string | null) => void;
  setCredentials: (c: Credential[]) => void;
};

type AppStore = AppState & AppActions;

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      sessionToken: null,
      setSessionToken: (t) => set(() => ({ sessionToken: t })),
      credentials: [],
      setCredentials: (c) => set(() => ({ credentials: c })),
    }),
    {
      name: 'orion-storage',
    }
  )
);
