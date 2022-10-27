import create from "zustand";
import { persist } from "zustand/middleware";

import type { GameAppStore } from "./types";
import { initialGameState } from "./defaults";

import { onArrived } from "./handlers/on-arrived";
import { onCityTaken } from "./handlers/on-city-taken";
import { onGameTick } from "./handlers/on-game-tick";

const persistOptions = {
  name: "game-storage",
  onRehydrateStorage: () => (state: GameAppStore | undefined) => {
    console.log("onRehydrateStorage", state);
    // state.setHasHydrated(true);
  },
};
//
const useGameAppStore = create<GameAppStore>(
  persist(
    (set, get, api) => ({
      ...initialGameState,
      //
      setMoving: (b, code) =>
        set((prev) => {
          // const hasArrived = !b && prev.moving;
          // const hasLeft = b && !prev.moving;
          //
          return prev.moving
            ? onArrived(prev, code)
            : {
                moving: true,
                codesConverting: prev.codesConverting,
                progressConverting: { ...prev.progressConverting },
              };
        }),
      //
      setSelectedCode: (c) =>
        set((prev) => ({
          selectedCode: c,
          lastSelectedCode: prev.selectedCode,
        })),
      //
      setProgressCompleted: (c, pop) =>
        set((prev) => onCityTaken(prev, c, pop)),
      //
      setZoom: (b) => set((prev) => ({ zoom: b })),
      //
      setUserColor: (s: string) => set((prev) => ({ userColor: s })),
      setCitiesMaxRangeKm: (km: number) =>
        set((prev) => ({ citiesMaxRangeKm: km })),
      setCitiesMaxItems: (n: number) => set((prev) => ({ citiesMaxItems: n })),
      setCitiesShowPopulated: (b) =>
        set((prev) => ({ citiesShowPopulated: b })),
      setLastTakenPlaceImageUrl: (url: string | undefined) =>
        set((prev) => ({ lastTakenPlaceImageUrl: url })),
      //
      setNextFrame: (n, t) =>
        set((prev) => {
          const nextTick = prev.frame + n;
          const totalTimePassed = prev.sinceLastGameTick + t;
          const isGameTick = nextTick % 20 === 0;
          //
          return isGameTick
            ? onGameTick(prev, nextTick, totalTimePassed)
            : {
                frame: nextTick,
                lastTickTime: prev.lastTickTime,
                sinceLastGameTick: totalTimePassed,
                detectedFps: prev.detectedFps,
                progressConverting: prev.progressConverting,
              };
        }),
      //
      reset: () => set(initialGameState),
      //
      setBounds: (b) => set((prev) => ({ bounds: b })),
      //
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
    }),
    persistOptions
  )
);

export default useGameAppStore;
