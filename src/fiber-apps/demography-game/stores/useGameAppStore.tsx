import create from "zustand";

export type GameAppStore = {
  count: number;
  bounds: [number, number, number, number];
  position: { x: number; y: number; z: number };
  //
  add: (n: number) => void;
  setBounds: (b: [number, number, number, number]) => void;
  setPosition: (p: { x: number; y: number; z: number }) => void;
  decreasePositionY: (timeout: number) => void;
};

const startPosition = { x: 17, y: 0, z: 45 } as {
  x: number;
  y: number;
  z: number;
};

//'HU': ('Hungary', (16.2022982113, 45.7594811061, 22.710531447, 48.6238540716)),
// const defaultBounds = [-3, 3, -2, 2] as [number, number, number, number];
const defaultBounds = [16, 23, 45, 49] as [number, number, number, number];

const useGameAppStore = create<GameAppStore>((set) => ({
  count: 0,
  bounds: defaultBounds,
  position: startPosition,
  //
  add: (n) => set((prev) => ({ count: prev.count + n })),
  setBounds: (b) => set((prev) => ({ bounds: b })),
  setPosition: (p) => set((prev) => ({ position: p })),
  decreasePositionY: (timeout) => {
    setTimeout(
      () =>
        set((prev) => ({
          position: {
            ...prev.position,
            y: prev.position.y - 1,
          },
        })),
      timeout
    );
  },
}));

export default useGameAppStore;
