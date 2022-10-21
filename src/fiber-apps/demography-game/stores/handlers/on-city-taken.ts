import { GameAppStore } from "../types";

export const onCityTaken = (
  s: GameAppStore,
  code: string,
  population: number
) => {
  const nextCodesTaken = [...s.codesTaken, code];
  const nextCodesConverting = [
    ...(s.codesConverting.filter((c) => c !== code) ?? []),
  ];
  //
  const nextEntriesProgressConverting = Object.entries(
    s.progressConverting
  ).filter(([k, v]) => nextCodesConverting.includes(k));
  const nextProgressConverting = Object.fromEntries(
    nextEntriesProgressConverting
  );
  //
  // console.log("onCityTaken", code, population, s.progressConverting, nextProgressConverting);
  //
  const stats = s.player;
  const nextTakenPopulation = stats.takenPopulation + population;
  const nextTakenCities = nextCodesTaken.length;
  //
  const nextPlayerStats = {
    ...stats,
    takenPopulation: nextTakenPopulation,
    takenCities: nextTakenCities,
    conversionSpeed:
      stats.baseConversionSpeed +
      nextTakenCities * 0.01 +
      nextTakenPopulation * 0.0001,
  };

  //
  return {
    codesTaken: nextCodesTaken,
    codesConverting: nextCodesConverting,
    progressConverting: nextProgressConverting,
    //
    player: nextPlayerStats,
  };
};
