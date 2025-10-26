import { createWithEqualityFn as create } from 'zustand/traditional';

export type ConnectionInfo = {
  token: string;
  deviceId: number;
};

type AppState = {
  sessions: Map<string, ConnectionInfo>;
  currentSession: string | null; // token
};

type AppActions = {
  addSession: (s: ConnectionInfo) => void;
  removeSession: (token: string) => void;
  setCurrentSession: (token: string | null) => void;
};

type AppStore = AppState & AppActions;

export const useAppStore = create<AppStore>((set) => ({
  sessions: new Map(),
  currentSession: null,
  credentials: [],
  addSession: (s) =>
    set((state) => ({
      sessions: state.sessions.set(s.token, s),
      currentSession:
        state.currentSession === null ? s.token : state.currentSession,
    })),
  removeSession: (token) =>
    set((state) => {
      state.sessions.delete(token);
      const newCurrent =
        state.currentSession === token ? null : state.currentSession;
      return { sessions: state.sessions, currentSession: newCurrent };
    }),
  setCurrentSession: (token) => set(() => ({ currentSession: token })),
}));
