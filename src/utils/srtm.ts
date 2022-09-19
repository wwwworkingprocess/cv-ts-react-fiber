//
// data is 1201x1201 with 1*1200 and 1200*1 overlap
// on 'right' and 'bottom' part, cropping to 1200x1200
//
export const removeLastRowAndColumn = (data: ArrayBuffer) => {
  const int16a = new Int16Array(data);
  const bitmap_1200_1200 = int16a.filter(
    (v, i, a) => (i + 1) % 1201 !== 0 && i < 1200 * 1201
  );
  //
  return bitmap_1200_1200;
};

//
//TODO: create dataview on the same buffer instead
//
export const changeEndianness = (int16a: Int16Array) =>
  int16a.map((v, i) => {
    const b = v % 256;
    const a = (v - b) / 256;
    //
    return b * 256 + a;
  });

//
// Replacing nodata value and extremal values
// consider averaging nearby pixels instead
// to fix 'crappy looking mountains'
//
export const normalizeElevationData = (int16a: Int16Array) => {
  const MIN_ACCEPTED_HEIGHT = -10; // -128;
  const SRTM_NODATA_VALUE = 32768;
  //
  const arr_at_min_elevation = int16a.map((x) =>
    x === SRTM_NODATA_VALUE
      ? MIN_ACCEPTED_HEIGHT
      : Math.max(x, MIN_ACCEPTED_HEIGHT)
  );
  //
  return arr_at_min_elevation;
};
