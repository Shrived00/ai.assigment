import { create } from 'zustand';

type Store = {
    userId: string | null;
    setUserId: (id: string) => void;
};

export const useStore = create<Store>()((set) => ({
    userId: null,
    setUserId: (id: string) => set({ userId: id }),
}));
