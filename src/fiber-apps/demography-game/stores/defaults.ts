import { isMobile } from "react-device-detect";

import { GameState, PlayerStats } from "./types";

//TODO: fix this, when enabling other countries
const defaultBounds = [16, 23, 45, 49] as [number, number, number, number];
const startPosition = { x: 17, y: 0, z: 45 } as {
  x: number;
  y: number;
  z: number;
};

const MAX_RANGE_TO_SHOW = 50;
const MAX_ITEMS_TO_SHOW = isMobile ? 100 : 350;

//
// Initial store state
//
export const initialGameState: GameState = {
  zoom: false,
  extraZoom: false,

  moving: false,
  selectedCode: undefined,
  lastSelectedCode: undefined,
  //
  codesTaken: [] as Array<string>,
  codesConverting: [] as Array<string>,
  progressConverting: {} as Record<string, number>,
  //
  frame: 0,
  //
  lastTickTime: 0,
  sinceLastGameTick: 0,
  detectedFps: 0,
  //
  bounds: defaultBounds,
  position: startPosition,
  //
  player: {
    baseConversionSpeed: 20,
    conversionSpeed: 10,
    takenCities: 0,
    takenPopulation: 0,
  } as PlayerStats,
  //
  canvasHeightRatio: 0.4,
  userColor: "#000055",
  citiesMaxRangeKm: MAX_RANGE_TO_SHOW,
  citiesMaxItems: MAX_ITEMS_TO_SHOW,
  citiesShowPopulated: true,
  //
  lastFeature: {
    imageUrl: undefined,
    geoJsonUrl: undefined,
  },
};
