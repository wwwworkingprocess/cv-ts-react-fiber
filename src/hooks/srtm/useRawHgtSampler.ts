import { useMemo } from "react";
import { changeEndianness } from "../../utils/srtm";

const GEN = {
  G2X: [0, 600],
  G3X: [0, 400, 800],
  G4X: [0, 300, 600, 900],
  G5X: [0, 240, 480, 720, 960],
  G6X: [0, 200, 400, 600, 800, 1000],
  G8X: [0, 150, 300, 450, 600, 750, 900, 1050],
  G10X: [0, 120, 240, 360, 480, 600, 720, 840, 960, 1080],
  G12X: [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100],
} as Record<string, Array<number>>;

const _arrN = (row_n: number, g: Array<number>, ia16: Int16Array) =>
  g.map((i) => ia16[i + 1201 * g[row_n]]);
const _init_stripe = (generator: Array<number>) =>
  Array.from(new Array(generator.length).keys());
const _sample = (ia: Int16Array, g: Array<number>) => {
  const res = _init_stripe(g)
    .map((block_idx) => _arrN(block_idx, g, ia))
    .flat();
  return res;
};

//
// Sampling data from the provided arraybuffer
// This hook works with the original hgt content (1201x1201)
//
const useRawHgtSampler = (arraybuffer: ArrayBuffer | null) => {
  const _1pt_per_tile = (int16array: Int16Array) => {
    return [int16array[0]];
  }; // 1x1 array of 1 px (LowerLeft)
  //
  const _4pt_per_tile = (int16array: Int16Array) => {
    const FL = int16array[0],
      LR = int16array[int16array.length - 1];
    const FR = int16array[1200],
      LL = int16array[int16array.length - 1 - 1200];
    //
    return [FL, FR, LL, LR];
  };
  //
  const _9pt_per_tile = (int16array: Int16Array) => {
    const FL = int16array[0],
      LR = int16array[int16array.length - 1];
    const FR = int16array[1200],
      LL = int16array[int16array.length - 1 - 1200];
    const FC = int16array[600],
      LC = int16array[int16array.length - 1 - 600];
    //
    const CL = int16array[0 + 1201 * 600],
      CC = int16array[600 + 1201 * 600],
      CR = int16array[1200 + 1201 * 600];
    //
    return [FL, FC, FR, CL, CC, CR, LL, LC, LR];
  };
  //
  const create_res_nxn_per_tile = (int16array: Int16Array, n: number) =>
    _sample(int16array, GEN[`G${n}X`]); // 4x4
  //
  const i16 = useMemo(
    () =>
      arraybuffer && arraybuffer.byteLength === 2884802
        ? changeEndianness(new Int16Array(arraybuffer))
        : undefined,
    [arraybuffer]
  );
  //
  return useMemo(() => {
    return i16
      ? {
          pt1: _1pt_per_tile(i16),
          pt4: _4pt_per_tile(i16),
          pt9: _9pt_per_tile(i16),
          pt16: create_res_nxn_per_tile(i16, 4),
          pt25: create_res_nxn_per_tile(i16, 5),
          pt144: create_res_nxn_per_tile(i16, 12),
        }
      : undefined;
  }, [i16]);
};

export default useRawHgtSampler;
