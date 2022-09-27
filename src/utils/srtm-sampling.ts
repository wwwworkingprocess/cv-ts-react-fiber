import {
  DataTexture,
  LinearFilter,
  RGBAFormat,
  sRGBEncoding,
  UnsignedByteType,
} from "three";

//
// Sampling every nth datavalue from the original arraybuffer.
// returns indices of the original arraybuffer.
//
export const createOffsetsForBlock = (
  G: Array<number>, // sampling points
  n: number,
  m: number,
  scale: number // block splitting factor e.g 4 -> 4x4 block per tile (16)
) => {
  const sub_x = (n % scale) * (1200 / scale);
  const sub_y = (m % scale) * (1200 / scale);
  const target_offset = sub_y * 1201 * 2 + sub_x * 2;
  //
  const offsets = G.map((r, ri) =>
    G.map((c, ci) => {
      const o: number = target_offset + (300 - r) * 1201 * 2 + c * 2;

      return Math.floor(o);
    })
  ).flat();
  //
  return offsets;
};

//
// Returns a Datatexture, based on the colors array and
// dimension information. The texture is NOT antialased,
// and encoded as sRGB
//
export const createTextureFromColors = (
  colors: Array<{ r: number; g: number; b: number; a: number }>,
  width: number,
  height: number
) => {
  const uint8arr = Uint8Array.from(
    colors.map((c) => [c.r, c.g, c.b, c.a]).flat()
  );
  const texture = new DataTexture(
    uint8arr,
    width,
    height,
    RGBAFormat,
    UnsignedByteType
  );
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.encoding = sRGBEncoding;
  //
  return texture;
};

//
// Returns a Float32Array to be used to position vertices of a sampled tile. (xyz coords)
// The positioning is dependent on the grid layout, the size of each tile
// and also the sampling.
//
// E.g.:
// Output: is a tile facing upwards, with a size of 1x1 world units
// Input:
//  sampling: 4  -> 4x4 = 16    --- 4x4 grid per original 1201x1201 tile -> 16x(300x300)
//  G:  [0,50,100,150,200,250]  ---   6 samples per tile
//  heightStripe: 6x6 = 36      ---  36 samples taken from each 300x300 block
//
export const createPositionsFromHeights = (
  heightStripe: Array<number>,
  G: Array<number>,
  magic_x: number = 0.75, // adjust value to increase tile size on primary axis
  magic_y: number = 0.75 // adjust value to increase tile size on secondary axis
) => {
  const l = G.length;
  let maxLength = l * l - 1;
  let coordsLength = l * l * 3;
  //
  const f32 = new Float32Array(coordsLength);
  //
  const unit_per_x = 1 / (l - 1 - magic_x);
  const unit_per_z = 1 / (l - magic_y);
  //
  for (let xi = 0; xi < l; xi++) {
    for (let zi = 0; zi < l; zi++) {
      let x = (xi - l / 2) * unit_per_x;
      let z = (zi - l / 2) * unit_per_z;
      //
      const rawValue = heightStripe[maxLength - xi * l + zi];
      //
      //TODO: rawValue gets out of bounds, that's why we are reading NaNs
      //
      let HEIGHT = (isNaN(rawValue) ? 0 : rawValue) * 0.00041;
      //
      const coordsOffset = (xi * l + zi) * 3;
      f32[coordsOffset] = z;
      f32[coordsOffset + 1] = -x;
      f32[coordsOffset + 2] = HEIGHT;
    }
  }
  //
  return f32;
};
