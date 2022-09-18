import { useCallback, useEffect, useState } from "react";

// Retrieving a HGT format heightmap file from the specified location
//
// - original dimension is 1201x1201
// - output dimension is 1200x1200
// - min elevation is MIN_ACCEPTED_HEIGHT
//
const useHgtSource = (url: string) => {
  const [value, setValue] = useState<Int16Array | undefined>();

  //
  // data is 1201x1201 with 1*1200 and 1200*1 overlap
  // on 'right' and 'bottom' part, cropping to 1200x1200
  //
  const removeLastRowAndColumn = (data: ArrayBuffer) => {
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
  const changeEndianness = (int16a: Int16Array) =>
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
  const normalizeElevationData = (int16a: Int16Array) => {
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

  //
  // Loading a remote HGT file and normalizing it for use
  //
  useEffect(() => {
    if (url) {
      fetch(url)
        .then((res) => res.arrayBuffer())
        .then(removeLastRowAndColumn)
        .then(changeEndianness)
        .then(normalizeElevationData)
        .then(setValue);
    }
  }, [url]);

  return value;
};

export default useHgtSource;
