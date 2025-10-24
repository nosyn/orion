import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Credential = {
  id?: number;
  host: string;
  port: number;
  username: string;
  authType: 'password' | 'key';
  password?: string | null;
  privateKeyPath?: string | null;
};

type AppState = {
  sessionToken: string | null;
  setSessionToken: (t: string | null) => void;
  credentials: Credential[];
  setCredentials: (c: Credential[]) => void;
};

export const useAppStore = create<AppState>()(
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
