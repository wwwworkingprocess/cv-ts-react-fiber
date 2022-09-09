import { useCallback, useEffect, useState } from "react";

const useHgtSource = (url: string) => {
  const [value, setValue] = useState<Int16Array | undefined>();
  //
  const onDataReceived = useCallback((data: ArrayBuffer) => {
    console.log("processing hgt", data);

    //
    // data is 1201x1201 with 1*1200 and 1200*1 overlap
    // on 'right' and 'bottom' part, cropping to 1200x1200
    //
    const int16a = new Int16Array(data);
    const bitmap_1200_1200 = int16a.filter(
      (v, i, a) => (i + 1) % 1201 !== 0 && i < 1200 * 1201
    );

    //
    // changing endianness, this should be fixed
    //
    const arr = [];
    for (var i = 0; i < bitmap_1200_1200.length; i++) {
      const v = bitmap_1200_1200[i];
      const b = v % 256;
      const a = (v - b) / 256;
      //
      arr.push(b * 256 + a);
    }

    //
    // Replacing nodata value, consider averaging nearby pixels
    // instead of using zeros, to fix 'crappy mountains
    //
    const SRTM_NODATA_VALUE = 32768;
    // const nodata_at_zero = arr.map((x) => (x === SRTM_NODATA_VALUE ? 0 : x));
    const nodata_at_minus_one = arr.map((x) =>
      x === SRTM_NODATA_VALUE ? -1 : x
    );
    //
    // setValue(Int16Array.from(nodata_at_minus_one));
    return new Int16Array(nodata_at_minus_one);
  }, []);
  //
  useEffect(() => {
    if (url) {
      fetch(url)
        .then((res) => res.arrayBuffer())
        .then(onDataReceived)
        .then(setValue);
    }
  }, [url, onDataReceived]);

  return value;
};

export default useHgtSource;
