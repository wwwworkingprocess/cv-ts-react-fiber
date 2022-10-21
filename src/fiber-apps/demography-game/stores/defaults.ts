import { GameState, PlayerStats } from "./types";

//TODO: fix this, when enabling other countries
const defaultBounds = [16, 23, 45, 49] as [number, number, number, number];
const startPosition = { x: 17, y: 0, z: 45 } as {
  x: number;
  y: number;
  z: number;
};

//
// Initial store state
//
export const initialGameState: GameState = {
  zoom: false,
  moving: false,
  selectedCode: undefined,
  lastSelectedCode: undefined,
  //
  codesTaken: [] as Array<string>,
  codesConverting: [] as Array<string>,
  progressConverting: {} as Record<string, number>,
  //
  count: 0,
  lastTickTime: 0,
  detectedFps: 0,
  //
  bounds: defaultBounds,
  position: startPosition,
  //
  player: {
    baseConversionSpeed: 20,
    conversionSpeed: 2,
    takenCities: 0,
    takenPopulation: 0,
  } as PlayerStats,
};
