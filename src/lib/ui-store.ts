import { create } from "zustand";

type UiState = {
  tokens: number | null;
  queue: number | null;
  revision: number;
  setTokens: (tokens: number) => void;
  setSnapshot: (tokens: number, queue: number | null) => void;
  touch: () => void;
};

export const useUi = create<UiState>((set) => ({
  tokens: null,
  queue: null,
  revision: 0,
  setTokens: (tokens) => set({ tokens }),
  setSnapshot: (tokens, queue) => set({ tokens, queue }),
  touch: () => set((s) => ({ revision: s.revision + 1 })),
}));
