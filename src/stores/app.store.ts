import { createWithEqualityFn as create } from 'zustand/traditional';

type AppState = {
  currentSession: string | null; // device id
};

type AppActions = {
  setCurrentSession: (deviceId: string | null) => void;
};

type AppStore = AppState & AppActions;

export const useAppStore = create<AppStore>((set) => ({
  currentSession: null,
  setCurrentSession: (deviceId) => set(() => ({ currentSession: deviceId })),
}));
