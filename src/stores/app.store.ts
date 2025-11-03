import { createWithEqualityFn as create } from 'zustand/traditional';

type AppState = {};

type AppActions = {};

type AppStore = AppState & AppActions;

export const useAppStore = create<AppStore>(() => ({}));
