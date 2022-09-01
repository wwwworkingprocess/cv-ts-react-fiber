import palettes from "../palettes.json";

export const useColorPalette = (themeId: number) => {
  const colors = palettes[themeId];
  //
  return { palettes, currentColors: colors };
};
