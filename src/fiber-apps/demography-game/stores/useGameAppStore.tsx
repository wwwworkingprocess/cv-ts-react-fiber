import create from "zustand";
import { persist } from "zustand/middleware";

import type { GameAppStore } from "./types";
import { initialGameState } from "./defaults";

import { onArrived } from "./handlers/on-arrived";
import { onCityTaken } from "./handlers/on-city-taken";
import { onGameTick } from "./handlers/on-game-tick";

const blacklist = [
  "frame",
  "detectedFps",
  "sinceLastGameTick",
] as Array<string>;
//
const persistOptions = {
  name: "game-storage",
  //
  partialize: (state: GameAppStore) =>
    Object.fromEntries(
      Object.entries(state).filter(([key]) => !blacklist.includes(key))
    ),
  //
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
          const codeChanged = code !== prev.lastSelectedCode;
          const hasArrived = !b && prev.moving;
          // const hasLeft = b && !prev.moving;
          //
          return codeChanged && hasArrived
            ? onArrived(prev, code)
            : {
                moving: true,
                codesConverting: prev.codesConverting,
                progressConverting: { ...prev.progressConverting },
              };
        }),
      //
      setSelectedCode: (c) =>
        set((prev) =>
          prev.selectedCode !== c // has the code really changed?
            ? {
                selectedCode: c,
                lastSelectedCode: prev.selectedCode,
              }
            : {
                selectedCode: prev.selectedCode,
                lastSelectedCode: prev.lastSelectedCode,
              }
        ),
      //
      setProgressCompleted: (c, pop) =>
        set((prev) => onCityTaken(prev, c, pop)),
      //
      setZoom: (b) => set((prev) => ({ zoom: b })),
      setExtraZoom: (b) => set((prev) => ({ extraZoom: b })),
      //
      setUserColor: (s: string) => set((prev) => ({ userColor: s })),
      setCitiesMaxRangeKm: (km: number) =>
        set((prev) => ({ citiesMaxRangeKm: km })),
      setCitiesMaxItems: (n: number) => set((prev) => ({ citiesMaxItems: n })),
      setCitiesShowPopulated: (b) =>
        set((prev) => ({ citiesShowPopulated: b })),
      //
      setLastTakenPlaceImageUrl: (url: string | undefined) =>
        set((prev) => ({
          lastFeature: { ...prev.lastFeature, imageUrl: url },
        })),
      //
      setLastTakenPlaceGeoJsonUrl: (url: string | undefined) =>
        set((prev) => ({
          lastFeature: { ...prev.lastFeature, geoJsonUrl: url },
        })),
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
