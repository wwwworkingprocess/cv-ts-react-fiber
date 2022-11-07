export type PlayerStats = {
  takenPopulation: number;
  takenCities: number;
  baseConversionSpeed: number;
  conversionSpeed: number;
};

export type GameState = {
  zoom: boolean;
  moving: boolean;
  selectedCode: string | undefined;
  lastSelectedCode: string | undefined;
  //
  codesTaken: Array<string>;
  codesConverting: Array<string>;
  progressConverting: Record<string, number>;
  //
  frame: number;
  sinceLastGameTick: number;
  lastTickTime: number;
  detectedFps: number;
  //
  bounds: [number, number, number, number];
  position: { x: number; y: number; z: number };
  //
  player: PlayerStats;
  //
  userColor: string;
  citiesMaxRangeKm: number;
  citiesMaxItems: number;
  citiesShowPopulated: boolean;
  //
  lastFeature: {
    imageUrl: string | undefined;
    geoJsonUrl: string | undefined;
  };
};

export type GameActions = {
  setMoving: (b: boolean, code: string) => void;
  setSelectedCode: (c: string | undefined) => void;
  setZoom: (b: boolean) => void;
  setProgressCompleted: (code: string, population: number) => void;
  //
  setUserColor: (s: string) => void;
  setCitiesMaxRangeKm: (km: number) => void;
  setCitiesMaxItems: (n: number) => void;
  setCitiesShowPopulated: (b: boolean) => void;
  //
  setLastTakenPlaceImageUrl: (s: string | undefined) => void;
  setLastTakenPlaceGeoJsonUrl: (s: string | undefined) => void;
  //
  setNextFrame: (n: number, t: number) => void;
  setBounds: (b: [number, number, number, number]) => void;
  setPosition: (p: { x: number; y: number; z: number }) => void;
  decreasePositionY: (timeout: number) => void;
  //
  reset: () => void;
};

export type GameAppStore = GameState & GameActions;
