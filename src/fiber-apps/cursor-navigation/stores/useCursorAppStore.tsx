import create from "zustand";

export type CursorAppStore = {
  count: number;
  bounds: [number, number, number, number];
  position: { x: number; y: number; z: number };
  //
  add: (n: number) => void;
  setBounds: (b: [number, number, number, number]) => void;
  setPosition: (p: { x: number; y: number; z: number }) => void;
  decreasePositionY: (timeout: number) => void;
};

const startPosition = { x: 1, y: 0, z: 0 } as {
  x: number;
  y: number;
  z: number;
};
const defaultBounds = [-3, 3, -2, 2] as [number, number, number, number];

const useCursorAppStore = create<CursorAppStore>((set) => ({
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

export default useCursorAppStore;
