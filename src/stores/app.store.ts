import { Credential } from '@/types/db.type';
import { createWithEqualityFn as create } from 'zustand/traditional';
import { persist } from 'zustand/middleware';

export type SessionInfo = {
  token: string;
  device_id?: number;
  host?: string;
  username?: string;
};

type AppState = {
  sessions: Record<string, SessionInfo>;
  currentSession: string | null; // token
  credentials: Credential[];
};

type AppActions = {
  addSession: (s: SessionInfo) => void;
  removeSession: (token: string) => void;
  setCurrentSession: (token: string | null) => void;
  setCredentials: (c: Credential[]) => void;
};

type AppStore = AppState & AppActions;

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      sessions: {},
      currentSession: null,
      credentials: [],
      addSession: (s) =>
        set((state) => ({
          sessions: { ...state.sessions, [s.token]: s },
          currentSession: s.token,
        })),
      removeSession: (token) =>
        set((state) => {
          const { [token]: _, ...rest } = state.sessions;
          const newCurrent =
            state.currentSession === token ? null : state.currentSession;
          return { sessions: rest, currentSession: newCurrent };
        }),
      setCurrentSession: (token) => set(() => ({ currentSession: token })),
      setCredentials: (c) => set(() => ({ credentials: c })),
    }),
    {
      name: 'orion-storage',
    }
  )
);
